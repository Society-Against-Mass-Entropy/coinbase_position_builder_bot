/**
 * go through entire fills history and generate a history file
 * invoke like so:
 *
 * CPBB_TICKER=ETH CPBB_CURRENCY=USD CPBB_APY=150 CPBB_SINCE=2015-01-01 node create.history.js
 *
 * or to use a cached fills file:
 * CPBB_TICKER=ETH CPBB_CURRENCY=USD CPBB_APY=150 CPBB_SINCE=2015-01-01 CPBB_FILLS=../data/fills_ETH-USD.json node create.history.js
 *
 */
const { exec } = require("child_process");
const config = require("../config");
const fs = require("fs");
const log = require("../lib/log");
const getFills = require("../coinbase/get.fills");
const history = require("../lib/history");
const map = require("lodash.map");
const { multiply } = require("../lib/math");

log.zap("load fills", process.env.CPBB_FILLS);
const fillsFromFile = process.env.CPBB_FILLS
  ? require(process.env.CPBB_FILLS)
  : [];
log.debug(fillsFromFile[0]);

const backup = config.history_file.replace(
  ".tsv",
  `_backup_${new Date().getTime()}.tsv`
);
fs.copyFileSync(config.history_file, backup);
log.ok(`backed up history file in ${backup}`);

(async () => {
  const fills = fillsFromFile.length
    ? fillsFromFile.filter(
        (f) => new Date(f.create_at) > process.env.CPBB_SINCE || "2015-01-01"
      )
    : await getFills({ since: process.env.CPBB_SINCE || "2010-01-01" });
  // so we can rerun this without calling the API again
  if (!fillsFromFile.length)
    fs.writeFileSync(
      `${__dirname}/../data/fills_${config.productID}.json`,
      JSON.stringify(fills, null, 2)
    );

  // reverse it to oldest->newest
  fills.reverse();

  log.ok("first fill record: ", fills[0]);
  const all = fills.map((f) => {
    // if(!f.usd_volume){
    //   log.debug('no volume?', f);
    // }
    const funds = multiply(f.price, f.size);
    return {
      Time: f.created_at,
      Price: f.price,
      Holding: 0,
      Value: 0,
      Funds: f.side === "sell" ? multiply(funds, -1) : funds,
      Shares: f.side === "sell" ? multiply(f.size, -1) : f.size,
      PeriodRate: 0,
      ExpectedGain: 0,
      TotalInput: 0,
      Target: 0,
      Diff: 0,
      EndValue: 0,
      Realized: 0,
      TotalValue: 0,
      Liquid: 0,
      Profit: 0,
      ID: f.order_id,
    };
  });

  // write new history file
  const headers = history.headerRow.includes("\tID")
    ? history.headerRow
    : history.headerRow + "\tID";
  const data = [
    `${headers}`,
    ...all.map((row) => map(row, (v) => v).join("\t")),
  ].join("\n");

  // log.debug(data)
  const file = `${__dirname}/../data/history.${config.productID}.tsv`;
  fs.writeFileSync(file, data);
  log.ok(`updated history ${file} from api data`);

  exec("node ./adjust.apy.js", process.env, (error, stdout, stderr) => {
    if (error) {
      log.error(`exec error: ${error}`);
      return;
    }
    log.ok(stdout);
    if (stderr) log.error(stderr);
  });

  log.ok("all done");
})();
