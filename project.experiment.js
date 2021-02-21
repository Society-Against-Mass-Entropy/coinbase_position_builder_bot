/**
 * project what our chart would look like if the asset
 * goes within $15,000 to $100,000 until 2021-12-31 with $100 every 6 hours (360 minutes), a Target APY of 100% and a 0-10% price change each period, with a 50% chance of going down, but with a pull upward to the ceiling (up or down)
 * CPBB_TICKER=BTC CPBB_CURRENCY=USD CPBB_VOL=100 CPBB_APY=100 node project.target.js 360 2021-12-31 0.1 0.9
 */
const fs = require("fs");
const { add, divide, multiply, subtract } = require("mathjs");

const config = require("./config");
const calcAction = require("./lib/calculate.action");
const log = require("./lib/log");
const logSave = require("./lib/log.save");
const memory = require('./data/memory');
const ticker = `${config.ticker}-${config.currency}`;

const historyFile = `./data/history.${ticker}.tsv`;
const projectedFile = `./data/history.${ticker}.projected.tsv`;

const targetMinutes = process.argv[2];
const targetDate = process.argv[3];
const targetVolatility = process.argv[4];
const targetDownChance = process.argv[5];

// override config.historyFile so we save new logs in this script
// to the new projectedFile
config.history_file = projectedFile;

// copy existing history file to new projected file
fs.copyFileSync(historyFile, projectedFile);

// console.log(memory.lastLog);
const startTime = new Date(memory.lastLog.Time).getTime();
const endTime = new Date(targetDate).getTime();
const periods = Math.floor(divide(subtract(endTime, startTime), multiply(60000, targetMinutes)));
// 80% correction (grows over time)
let targetFloor = multiply(memory.lastLog.Price, .8);
// could go up 50% in the next period (this grows over time)
let targetCeiling = multiply(memory.lastLog.Price, 1.5);

let direction = 1;
let priceStart = 0;
let periodCounter = 0;

(async () => {
  for (let i = 0; i < periods; i++) {
    let remainingPeriods = periods - i;
    let price = memory.lastLog.Price;
    let change = multiply(price, Math.random(), targetVolatility);
    let percentRemaining = (remainingPeriods / periods);
    targetFloor = add(targetFloor, multiply(targetFloor, .001));
    targetCeiling = add(targetCeiling, multiply(targetCeiling, .001));

    priceStart = price;
    periodCounter++;
    if (periodCounter > 120) {
      // shift direction likelihood
      periodCounter = 0;
      direction = multiply(direction, -1);
    }

    if (add(price, change) > targetCeiling) {
      price = add(price, multiply(change, -1));
      // periodCounter = 0;
      // direction = multiply(direction, -1);
    }
    if (subtract(price, change) < targetFloor) {
      price = add(price, change);
      // periodCounter = 0;
      // direction = multiply(direction, -1);
    } else {
      if (direction === -1) {
        // are we really going to do it?
        change = multiply(change, Math.random() < targetDownChance * percentRemaining ? -1 : 1);
      }
      price = add(price, change);

    }


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
  log.now(`projected ${ticker} between $${targetFloor} - $${targetCeiling} until ${targetDate} with $${config.vol} every ${targetMinutes} minutes, targeting ${config.apy * 100}% APY, and a ${targetDownChance} chance of going down rather than up (diminishing over time)`);
})();
