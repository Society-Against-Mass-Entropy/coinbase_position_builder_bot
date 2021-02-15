/**
 * recaculates the target value using corrected rules
 * - if the prior action was a sell, remove that value from the target (we don't expect the account to have grown by the APY + that $ value)
 */
console.log(`🤖 Position Builder Engine Updater`);

const config = require('./config');
const fs = require("fs");
const history = require("./lib/history");
const { format, subtract, add } = require("mathjs");
const map = require("lodash.map");

const all = history.all();

for (let i = 1; i < all.length; i++) {
  let last = all[i - 1];
  all[i].Target = add(Math.abs(all[i].Funds), all[i].ExpectedGain, last.Target);
  if (last.Funds < 0) {
    all[i].Target = add(all[i].Target, last.Funds);
  }
  all[i].Diff = format(subtract(all[i].Value, all[i].Target), { notation: 'fixed', precision: 2 });

  // format
  all[i].Target = format(all[i].Target, { notation: 'fixed', precision: 2 });

}

const data = [
  `${history.headerRow}`,
  ...all.map(row => map(row, v => v).join("\t")),
].join("\n");

// console.log(data)
const file = `./data/history.${config.productID}.fixed.tsv`;
fs.writeFileSync(file, data);

console.log(`wrote updated history to ${file}\nIf this looks good, overwrite your original history file (without the '.fixed' name adjustment) and restart your app by running\npm2 reload all`)
