/**
 * recaculates the PeriodRate, ExpectedGain, Target, Diff using new APY
 *
 * example: (setting your target APY to 100% through history)
 *
 * CPBB_TICKER=BTC CPBB_APY=100 node adjust.apy.js
 */
const MS_PER_YEAR = 31556952000;
const config = require('../config');
const fs = require('fs');
const history = require('../lib/history');
const { divide, multiply, subtract, add } = require('../lib/math');
const log = require('../lib/log');
const getFills = require('../coinbase/get.fills');
const map = require('lodash.map');
log.bot(
  `Position Builder Engine Updater: Recalculating with ${multiply(
    config.apy,
    100
  )}% APY`
);
const backup = config.history_file.replace(
  '.tsv',
  `_pre-recalulation.backup_${new Date().getTime()}.tsv`
);
fs.copyFileSync(config.history_file, backup);
log.ok(`backed up history file in ${backup}`);
const all = history.all();

// make sure log is in correct time order
all.sort((a, b) => (new Date(a.Time) < new Date(b.Time) ? -1 : 1));

(async () => {
  const fills = await getFills({ since: all[0].Time });

  for (let i = 1; i < all.length; i++) {
    let last = all[i - 1];
    let current = all[i];
    // normalizing log vars to match API fill data for comparison

    let fill = fills.find(f => f.order_id === current.ID);

    if (!fill) {
      fill = fills.find(f => f.created_at === current.Time);
      all[i].ID = fill.order_id;
      // log.error(`fixing order id`, fill.order_id);
    }

    // if the fill data indicates that this was a Maker order (M) rather than a Taker (T)
    // then this transaction was made by a limit rebuy order
    let isRebuy = fill ? current.Funds > 0 && fill.liquidity === 'M' : false;

    if (i === 1) log.debug(current);
    let dateNow = new Date(current.Time);
    let dateLast = new Date(last.Time);
    // shouldn't have to do this with all.sort above
    // if (dateNow < dateLast) {
    //   // limit orders that previously were marked as completed out of order
    //   // fix
    //   dateNow = dateLast;
    // }
    let msPassed = dateNow - dateLast; // milliseconds delta

    all[i].Holding = add(last.Holding, last.Shares);
    all[i].Value = multiply(current.Holding, current.Price);
    // all[i].PeriodRate = subtract(
    //   pow(1 + config.apy, divide(1, divide(MS_PER_YEAR, msPassed))),
    //   1
    // );
    all[i].PeriodRate = divide(config.apy, divide(MS_PER_YEAR, msPassed));

    all[i].ExpectedGain = multiply(last.Target, current.PeriodRate);
    all[i].Target = add(
      add(Math.abs(current.Funds), current.ExpectedGain),
      last.Target
    );
    if (last.Funds < 0) {
      all[i].Target = add(current.Target, last.Funds);
    }
    all[i].Diff = subtract(current.Value, current.Target);
    all[i].EndValue = add(current.Value, current.Funds);
    all[i].Realized = add(
      last.Realized,
      all[i].Funds > 0 ? 0 : multiply(current.Funds, -1)
    );
    // total input does not subtract when we take profit (that's realized profit)
    all[i].TotalInput = add(
      last.TotalInput,
      all[i].Funds > 0 ? current.Funds : 0
    );

    // new test logic
    if (isRebuy) {
      console.log(
        `removing ${current.ID} ${current.Funds} from TotalInput and Realized`
      );
      // remove the value we added to TotalInput
      all[i].TotalInput = subtract(current.TotalInput, current.Funds);
      // remove from Realized
      all[i].Realized = subtract(current.Realized, current.Funds);
    }

    all[i].TotalValue = add(current.EndValue, current.Realized);
    all[i].Liquid = subtract(current.TotalValue, current.TotalInput);
    all[i].Profit =
      multiply(divide(current.Liquid, current.TotalInput), 100).toFixed(2) +
      '%';
    if (i === 1) log.debug(current);
  }

  const data = [
    `${history.headerRow}`,
    ...all.map(row => map(row, v => v).join('\t')),
  ].join('\n');

  log.debug(data);
  const file = `${__dirname}/../data/history.${config.productID}.tsv`;
  fs.writeFileSync(file, data);

  log.ok(
    `wrote updated history to ${file}\nIf something is wrong, restore history from backup.`
  );
})();
