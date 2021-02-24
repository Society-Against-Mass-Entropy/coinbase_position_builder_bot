/**
 * goes through the history file and adds order ID column
 *
 *
 * invoke like so:
 *
 * CPBB_TICKER=BTC CPBB_CURRENCY=USD CPBB_APY=150 node upgrade_2.2.0.js
 *
 */
const { exec } = require('child_process');
const config = require('../config');
const fs = require('fs');
const log = require('../lib/log');
const getFills = require('../coinbase/get.fills');
const history = require('../lib/history');
const touch = require('../lib/touch');
const map = require("lodash.map");

const uniqFilter = (value, index, self) => {
  return self.indexOf(value) === index;
}

// const fills = require(`../data/fills_${config.productID}.json`);
const { add, subtract } = require('../lib/math');
const backup = config.history_file.replace('.tsv', `_backup_${new Date().getTime()}.tsv`);
(async () => {
  // backup history file
  fs.copyFileSync(config.history_file, backup);
  log.ok(`backed up history file in ${backup}`);
  const all = history.all();

  log.ok('oldest item', all[0].Time);

  // now query all fills from API (paginated until the earliest history date)
  const fills = await getFills({ since: all[0].Time });
  // just for debugging
  fs.writeFileSync(`${__dirname}/../data/fills_${config.productID}.json`, JSON.stringify(fills, null, 2));

  // reverse it to oldest->newest to match history file
  fills.reverse().map(f => {
    // add timestamp for fuzzy search
    f.timestamp = new Date(f.created_at).getTime();
    f.timestampMax = f.timestamp + 30000;
    f.timestampMin = f.timestamp - 30000;
  });

  log.ok('first fill record: ', fills[0].created_at);

  // now go through the fills and match them to the history file
  // note: some fills might have been done outside this engine
  // additionally, some precision might be lost in old calculations or misreported results
  // so we do a fuzzy size+date match
  all.forEach(h => {
    const t = new Date(h.Time).getTime();
    const s = h.Shares + '';
    let matches = fills.filter(f => {
      if (f.timestamp === t && f.size === s) return true; // exact match
      // fuzzy
      return f.timestampMin < t && f.timestampMax > t;
    })
    if (!matches.length) {
      matches = fills.filter(f => Number(f.size) === h.Shares);
      if (!matches.length) {
        return log.error(`no match`, h);
      }
    }
    let orderIds = matches.map(o => o.order_id).filter(uniqFilter);
    if (orderIds.length > 1) {
      return log.error(`${orderIds.length} order ids matched`, h, matches);
    }

    // add the ID column (new in 2.2.0)
    h.ID = matches[0].order_id;

    const sold = matches[0].side === 'sell';

    let fee = 0;
    let shares = 0;
    let usd = 0;

    matches.forEach(m => {
      fee = add(fee, m.fee);
      shares = add(shares, m.size);
      usd = add(usd, m.usd_volume);
    });

    if (sold) {
      shares = shares * -1;
      usd = subtract(usd, fee) * -1;
    } else {
      usd = add(usd, fee);
    }
    const fmtShares = shares.toFixed(9);
    if (h.Shares != fmtShares) {
      log.ok(h.Time, h.Shares, fmtShares);
      h.Shares = shares;
    }
    h.Funds = usd.toFixed(9);
  });


  // write new history file
  const headers = history.headerRow.includes('\tID') ? history.headerRow : history.headerRow + '\tID';
  const data = [
    `${headers}`,
    ...all.map(row => map(row, v => v).join("\t")),
  ].join("\n");

  // console.log(data)
  const file = `${__dirname}/../data/history.${config.productID}.tsv`;
  fs.writeFileSync(file, data);
  log.ok(`updated history ${file} from api data`);

  exec('node ./adjust.apy.js', process.env, (error, stdout, stderr) => {
    if (error) {
      log.error(`exec error: ${error}`);
      return;
    }
    console.log(stdout);
    console.error(stderr);
  });


  // finally, touch the index file so our pm2 filewatcher will auto-restart the service
  // this will load the latest history file into memory for the next job run
  await touch('../index.js');

  log.ok('all done');

})();
