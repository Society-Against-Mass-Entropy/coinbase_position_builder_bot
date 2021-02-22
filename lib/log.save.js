const config = require("../config");
const { divide, multiply, subtract } = require("mathjs");
const fs = require("fs");
const log = require("./log");
const logOutput = require('./log.output');
const map = require("lodash.map");
const memory = require("./memory");
const numFix = require("./number.fix");

/**
 * Save the transaction to our logs and interface
 * @param {object} data {action, response} collection so far (given from previous task)
 */
module.exports = (data) => {
  const { action, response } = data;
  // update last log in memory
  const logData = {
    Time: action.dateNow.toISOString(),
    Price: action.exchangeRate,
    Holding: numFix(action.currentHolding, 8),
    Value: numFix(action.value, 2),
    Funds: action.funds,
    Shares: multiply(Number(response.filled_size), action.funds > 0 ? 1 : -1),
    PeriodRate: numFix(action.periodRate),
    ExpectedGain: numFix(action.expectedGain, 4),
    TotalInput: action.totalInput,
    Target: numFix(action.target, 2),
    Diff: numFix(action.diff, 2),
    EndValue: numFix(action.endValue, 2),
    Realized: action.realized,
    TotalValue: numFix(action.totalValue, 2),
    Liquid: numFix(action.liquidValue, 2),
    Profit:
      multiply(divide(action.liquidValue, action.totalInput), 100).toFixed(2) +
      "%",
  };
  memory.lastLog = logData;
  // log it to the terminal
  logOutput(logData);

  // save it to the history file--we can copy this into a spreadsheet to make charts :)
  // and this is our preserved investment state in case we kill the app and restart

  const cells = map(logData, (v) => v);
  const line = cells.join("\t");
  fs.appendFileSync(config.history_file, "\n" + line);
};
