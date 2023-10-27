/**
 * merge a tsv of transactions with the current history file
 *
 * example: (setting your target APY to 100% through history)
 *log
 * CPBB_TICKER=BTC CPBB_APY=100 node add.txn.js cashapp
 *
 * or for a dynamic APY setting (bigger market cap = less volatility)
 * below sets dyanmic APY starting at 200% at or below $5K price and approaches 10% as prices reaches $1M
 * CPBB_TICKER=BTC CPBB_APY_DYNAMIC=100@5000-5@1000000 node add.txn.js cashapp
 *
 * you must have a ../data/history.${nam}.tsv file
 * and it must contain the following columns:
 * Time	Price	Holding	Value	Funds	Shares
 * NOTE: Holding and Value cells can/should be empty
 *
 * It also must use proper numeric formatting (sold events have Funds like "-100", not "(100)" and not "-$100")
 * When sold, Funds and Shares should both be negative
 */
const MS_PER_YEAR = 31556952000;
const config = require('../config');
const dynamicAPY = require('../lib/dynamic.apy');
const fs = require('fs');
const history = require('../lib/history');
const { divide, multiply, precision, subtract, add } = require('../lib/math');
const log = require('../lib/log');
const map = require('lodash.map');

const mergeLogFile = process.argv[2];

log.bot(
  `Merging ${mergeLogFile} with ${
    process.env.CPBB_APY_DYNAMIC
      ? `dynamic (${process.env.CPBB_APY_DYNAMIC})`
      : `${multiply(config.apy, 100)}%`
  } APY`
);
const backup = config.history_file.replace(
  '.tsv',
  `_pre-merge.backup_${new Date().getTime()}.tsv`
);
fs.copyFileSync(config.history_file, backup);
log.ok(`backed up history file in ${backup}`);
const old = history.all();

const mergeData = fs.readFileSync(
  `${__dirname}/../data/history.${mergeLogFile}.tsv`,
  'utf8'
);
const mergeLines = mergeData.split('\n');
const mergeHeaders = mergeLines.shift().split('\t');
const merge = mergeLines.map(line => {
  const parts = line.split('\t');
  const obj = {};
  mergeHeaders.forEach((header, i) => {
    obj[header] = parts[i];
  });
  return obj;
});

log.ok(`loaded ${merge.length} lines from ${mergeLogFile}`);

// remove any existing records that are already of this merge type (so we don't double add)
const filteredHistory = old.filter(l => l.Method !== mergeLogFile);

log.ok(
  `removed ${
    old.length - filteredHistory.length
  } existing ${mergeLogFile} records`
);

// merge history

const all = [...filteredHistory, ...merge];

// make sure log is in correct time order
all.sort((a, b) => (new Date(a.Time) < new Date(b.Time) ? -1 : 1));

for (let i = 1; i < all.length; i++) {
  let last = all[i - 1];

  if (!last.Holding) last.Holding = add(0, last.Shares);
  if (!last.Value) last.Value = 0;
  if (!last.PeriodRate) last.PeriodRate = 0;
  if (!last.ExpectedGain) last.ExpectedGain = 0;
  if (!last.TotalInput) last.TotalInput = last.Funds;
  if (!last.Target) last.Target = last.Funds;
  if (!last.Diff) last.Diff = -last.Funds;
  if (!last.EndValue) last.EndValue = last.Funds;
  if (!last.Realized) last.Realized = 0;
  if (!last.TotalValue) last.TotalValue = last.Funds;
  if (!last.Liquid) last.Liquid = 0;
  if (!last.Profit) last.Profit = 0;
  if (!last.ID) last.ID = '';
  if (!last.Type) last.Type = 'market';
  if (!last.Method) last.Method = mergeLogFile;
  if (!last.TargetAPY) last.TargetAPY = dynamicAPY(Number(last.Price));

  const Holding = precision(add(last.Holding, last.Shares), 8);
  all[i] = {
    Time: all[i].Time,
    Price: all[i].Price,
    Holding,
    Value: precision(multiply(Holding, all[i].Price), 2),
    Funds: all[i].Funds,
    Shares: all[i].Shares,
    PeriodRate: all[i].PeriodRate || 0,
    ExpectedGain: all[i].ExpectedGain || 0,
    TotalInput: all[i].TotalInput || all[i].Funds,
    Target: all[i].Target || all[i].Funds,
    Diff: -all[i].Funds,
    EndValue: all[i].Funds,
    Realized: last.Realized,
    TotalValue: all[i].Funds,
    Liquid: 0,
    Profit: 0,
    ID: all[i].ID || '?',
    Type: all[i].Type || 'market',
    Method: all[i].Method || mergeLogFile,
    TargetAPY: dynamicAPY(Number(all[i].Price)),
  };

  let isRebuy = all[i].Method === 'rebuy';
  let isResell = all[i].Method === 'resell';

  if (i === 1) {
    log.debug(all[i]);
    all[0].TargetAPY = all[i].TargetAPY;
  }
  let dateNow = new Date(all[i].Time);
  let dateLast = new Date(last.Time);

  let msPassed = dateNow - dateLast; // milliseconds delta

  all[i].PeriodRate = divide(all[i].TargetAPY, divide(MS_PER_YEAR, msPassed));

  all[i].ExpectedGain = multiply(last.Target, all[i].PeriodRate);

  // add expected gain to the target (no matter what),
  // this is the baseline interest growth between the last log and this one
  all[i].Target = add(last.Target, all[i].ExpectedGain);
  // do not add fund value if this is a rebuy
  // (already added the first time we bought)
  if (!isRebuy) all[i].Target = add(all[i].Target, Math.abs(all[i].Funds));
  if (last.Funds < 0 && last.Method === 'cron') {
    // however, if we sold on the last cron action,
    // that vol shouldn't add to our growth target
    all[i].Target = add(all[i].Target, last.Funds);
  }
  all[i].Diff = subtract(all[i].Value, all[i].Target);
  all[i].EndValue = add(all[i].Value, all[i].Funds);

  if (isRebuy) {
    all[i].Realized = subtract(last.Realized, all[i].Funds);
    all[i].TotalInput = last.TotalInput || 0;
  } else if (isResell) {
    all[i].TotalInput = add(last.TotalInput, all[i].Funds);
  } else {
    all[i].Realized = add(
      last.Realized,
      all[i].Funds > 0 ? 0 : multiply(all[i].Funds, -1)
    );
    // total input does not subtract when we take profit (that's realized profit)
    all[i].TotalInput = add(
      last.TotalInput,
      all[i].Funds > 0 ? all[i].Funds : 0
    );
  }

  all[i].TotalValue = add(all[i].EndValue, all[i].Realized);
  all[i].Liquid = subtract(all[i].TotalValue, all[i].TotalInput);
  all[i].Profit =
    multiply(divide(all[i].Liquid, all[i].TotalInput), 100).toFixed(2) + '%';
  if (i === 1) log.debug(all[i]);
}

if (!history.headerRow.includes('	Type')) {
  history.headerRow += '	Type';
}
if (!history.headerRow.includes('	Method')) {
  history.headerRow += '	Method';
}
if (!history.headerRow.includes('	TargetAPY')) {
  history.headerRow += '	TargetAPY';
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
