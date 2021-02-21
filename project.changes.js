/**
 * project what our chart would look like if the asset
 * goes up 50% over 100 periods, then down 80% over 100 periods, etc
 * CPBB_TICKER=BTC CPBB_CURRENCY=USD CPBB_VOL=100 CPBB_APY=100 node project.changes.js 360 10%:50 -80%:200 20%:150 -40%:100 20%:100 -10%:100 40%:100
 * CPBB_TICKER=BTC CPBB_CURRENCY=USD CPBB_VOL=100 CPBB_APY=100 node project.changes.js 360 60000:50 50000:50 100000:200 50000:100 20000:100 15000:20 50000:100
 * CPBB_TICKER=BTC CPBB_CURRENCY=USD CPBB_VOL=100 CPBB_APY=100 node project.changes.js 360 32000:100 41500:75 20000:200 32600:100 14400:200 25000:200 20000:400 50000:800
 * CPBB_TICKER=BTC CPBB_CURRENCY=USD CPBB_VOL=100 CPBB_APY=100 node project.changes.js 360 32000:100 41500:75 20000:200 37000:100 30000:200 100000:200 70000:400 300000:800
 * CPBB_TICKER=BTC CPBB_CURRENCY=USD CPBB_VOL=100 CPBB_APY=150 node project.changes.js 360 32000:100 41500:75 20000:200 37000:100 30000:200 100000:400 50000:400 300000:800
 */
const fs = require("fs");
const { add, divide, multiply } = require("mathjs");

const config = require("./config");
const calcAction = require("./lib/calculate.action");
const log = require("./lib/log");
const logSave = require("./lib/log.save");
const memory = require('./data/memory');
const ticker = `${config.ticker}-${config.currency}`;

const historyFile = `./data/history.${ticker}.tsv`;
const projectedFile = `./data/history.${ticker}.projected.tsv`;

const targetMinutes = process.argv[2];

const changeSet = [...process.argv];
changeSet.shift();
changeSet.shift();
changeSet.shift();
log.now({ changeSet });

// override config.historyFile so we save new logs in this script
// to the new projectedFile
config.history_file = projectedFile;

// copy existing history file to new projected file
fs.copyFileSync(historyFile, projectedFile);
// console.log(memory.lastLog);
(async () => {
  for (let c = 0; c < changeSet.length; c++) {
    const change = changeSet[c];
    const changeParts = change.split(':');
    let usingPercent = changeParts[0].includes('%');
    const percentage = usingPercent ? Number(changeParts[0].replace('%', '')) / 100 : (Number(changeParts[0]) / memory.lastLog.Price) - 1;
    const periods = Number(changeParts[1]);
    const targetPrice = usingPercent ? add(memory.lastLog.Price, multiply(memory.lastLog.Price, percentage)) : Number(changeParts[0]);
    // const starting = memory.lastLog.Price;
    if (usingPercent) {
      console.log(`targeting ${percentage * 100}% change from $${memory.lastLog.Price} in ${periods} periods, which ends at $${targetPrice}`)
    } else {
      console.log(`targeting $${targetPrice} from $${memory.lastLog.Price} in ${periods} periods`)
    }
    let direction = targetPrice < memory.lastLog.Price ? -1 : 1;
    const startTime = new Date(memory.lastLog.Time).getTime();
    for (let i = 0; i < periods; i++) {

      let price = memory.lastLog.Price;
      let remainingPeriods = periods - i;
      let percentRemaining = (remainingPeriods / periods);
      let changeRemaining = (targetPrice - price);
      // if we had even change to our target
      let changePerPeriod = changeRemaining / remainingPeriods;

      let change = changePerPeriod; // linear change

      // let changeMultiplier = direction < 0 ? percentRemaining : 1;
      // let change = multiply(changePerPeriod, changeMultiplier);
      change = multiply(change, Math.random() < .5 * percentRemaining ? -1 : 1);

      price = add(price, change);
      // console.log(direction, price, targetPrice, changeMultiplier, change);
      if (direction === 1 && price > targetPrice) price = targetPrice;
      if (direction === -1 && price < targetPrice) price = targetPrice;

      // calculate the projected future date when this will occur
      const dateOverride = new Date(add(startTime, multiply(i + 1, targetMinutes, 60000)));
      const action = await calcAction({
        price,
        dateOverride,
      });
      action.dateNow = dateOverride
      logSave({
        action,
        response: {
          filled_size: divide(config.vol, price).toFixed(8),
        },
      });
    }
  }
})();
