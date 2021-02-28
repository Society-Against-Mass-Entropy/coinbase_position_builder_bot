/**
 * recaculates the target value using corrected rules
 * - if the prior action was a sell, remove that value from the target (we don't expect the account to have grown by the APY + that $ value)
 */

const config = require("../config");
const fs = require("fs");
const log = require("../lib/log");
const history = require("../lib/history");
const { subtract, add } = require("../lib/math");
const map = require("lodash.map");

log.bot(`Position Builder Engine Updater`);

const all = history.all();

for (let i = 1; i < all.length; i++) {
  let last = all[i - 1];
  all[i].Target = add(Math.abs(all[i].Funds), all[i].ExpectedGain, last.Target);
  if (last.Funds < 0) {
    all[i].Target = add(all[i].Target, last.Funds);
  }
  all[i].Diff = subtract(all[i].Value, all[i].Target);
}

const data = [
  `${history.headerRow}`,
  ...all.map(row => map(row, v => v).join("\t")),
].join("\n");

log.debug(data);
const file = `${__dirname}/../data/history.${config.productID}.fixed.tsv`;
fs.writeFileSync(file, data);
log.ok(
  `wrote updated history to ${file}\nIf this looks good, overwrite your original history file (without the '.fixed' name adjustment) and restart your app by running\npm2 reload all`
);
