/**
 * recaculates the PeriodRate, ExpectedGain, Target, Diff using new APY
 *
 * example: (setting your target APY to 150% through history)
 *
 * CPBB_TICKER=BTC CPBB_APY=150 node adjust.apy.js
 */
const MS_PER_YEAR = 31556952000;
const config = require('../config');
const fs = require("fs");
const history = require("../lib/history");
const { divide, format, multiply, subtract, add, pow } = require("mathjs");
const log = require('../lib/log');
const map = require("lodash.map");
console.log(`🤖 Position Builder Engine Updater: Recalculating with ${multiply(config.apy, 100)}% APY`);
const backup = config.history_file.replace('.tsv', `_pre-recalulation.backup_${new Date().getTime()}.tsv`);
fs.copyFileSync(config.history_file, backup);
log.ok(`backed up history file in ${backup}`);
const all = history.all();

for (let i = 1; i < all.length; i++) {
  let last = all[i - 1];
  // if (i === 1) console.log(all[i]);
  let dateNow = new Date(all[i].Time);
  let dateLast = new Date(last.Time);
  let msPassed = dateNow - dateLast; // milliseconds delta

  all[i].Holding = format(add(last.Holding, Number(last.Shares)), { precision: 8 });
  all[i].Shares = format(all[i].Shares, { precision: 8 });
  all[i].Value = multiply(all[i].Holding, all[i].Price);
  all[i].PeriodRate =
    pow(1 + config.apy, divide(1, divide(MS_PER_YEAR, msPassed))) - 1;
  all[i].ExpectedGain = multiply(last.Target, all[i].PeriodRate);
  all[i].Target = add(Math.abs(all[i].Funds), all[i].ExpectedGain, last.Target);
  if (last.Funds < 0) {
    all[i].Target = add(all[i].Target, last.Funds);
  }
  all[i].Diff = subtract(all[i].Value, all[i].Target);
  // format for log output
  all[i].Target = format(all[i].Target, { precision: 2 });
  all[i].Diff = format(all[i].Diff, { precision: 2 });
  all[i].ExpectedGain = format(all[i].ExpectedGain, { precision: 2 });
  all[i].PeriodRate = format(all[i].PeriodRate, { precision: 8 });
  all[i].EndValue = add(all[i].Value, all[i].Funds);
  all[i].Realized = add(
    last.Realized,
    all[i].Funds > 0 ? 0 : all[i].Funds * -1
  );
  // total input does not subtract when we take profit (that's realized profit)
  all[i].TotalInput = add(
    last.TotalInput,
    all[i].Funds > 0 ? all[i].Funds : 0
  );
  all[i].TotalValue = add(all[i].EndValue, all[i].Realized);
  all[i].Liquid = subtract(all[i].TotalValue, all[i].TotalInput);
  all[i].Profit =
    multiply(divide(all[i].Liquid, all[i].TotalInput), 100).toFixed(2) +
    "%"
  // if (i === 1) console.log(all[i]);
}

const data = [
  `${history.headerRow}`,
  ...all.map(row => map(row, v => v).join("\t")),
].join("\n");

// console.log(data)
const file = `${__dirname}/../data/history.${config.productID}.tsv`;
fs.writeFileSync(file, data);

console.log(`wrote updated history to ${file}\nIf something is wrong, restore history from backup.`);
