/**
 * recaculates the PeriodRate, ExpectedGain, Target, Diff using new APY
 *
 * example: (setting your target APY to 150% through history)
 *
 * CPBB_TICKER=BTC CPBB_APY=150 node adjust.apy.js
 */
const MS_PER_YEAR = 31556952000;
const config = require('./config');
console.log(`🤖 Position Builder Engine Updater: APY ${config.apy}x`);
const fs = require("fs");
const history = require("./lib/history");
const { divide, format, multiply, subtract, add, pow } = require("mathjs");
const map = require("lodash.map");

const all = history.all();

for (let i = 1; i < all.length; i++) {
  let last = all[i - 1];

  let dateNow = new Date(all[i].Time);
  let dateLast = new Date(last.Time);
  let msPassed = dateNow - dateLast; // milliseconds delta
  all[i].PeriodRate =
    pow(1 + config.apy, divide(1, divide(MS_PER_YEAR, msPassed))) - 1;
  all[i].ExpectedGain = multiply(last.Target, all[i].PeriodRate);
  if (last.Funds < 0) {
    all[i].Target = add(all[i].ExpectedGain, last.Target);
  } else {
    all[i].Target = add(last.Funds, all[i].ExpectedGain, last.Target);
  }
  all[i].Diff = subtract(all[i].Value, all[i].Target);
  // format for log output
  all[i].Target = format(all[i].Target, { notation: 'fixed', precision: 2 });
  all[i].Diff = format(all[i].Diff, { notation: 'fixed', precision: 2 });
  all[i].ExpectedGain = format(all[i].ExpectedGain, { notation: 'fixed', precision: 2 });
}

const data = [
  `${history.headerRow}`,
  ...all.map(row => map(row, v => v).join("\t")),
].join("\n");

// console.log(data)
const file = `./data/history.${config.productID}.fixed.apy.tsv`;
fs.writeFileSync(file, data);

console.log(`wrote updated history to ${file}\nIf this looks good, overwrite your original history file (without the '.fixed.apy' name adjustment) and restart your app by running\npm2 reload all`)
