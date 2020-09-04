const config = require("../config");
const { divide, multiply, subtract } = require("mathjs");
const fs = require("fs");
const log = require("./log");
const map = require("lodash.map");
const memory = require("../data/memory");
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
  const emoji =
    (process.env.CPBB_DRY_RUN ? "🚫 " : "") + (action.funds > 0 ? "💸" : "🤑");

  log.now(
    `${emoji} ${logData.Time} ${
    logData.Funds > 0
      ? `${Math.abs(logData.Funds)} ${config.currency} ➡️  ${Math.abs(
        logData.Shares
      ).toFixed(8)} ${config.ticker} @ ${logData.Price.toFixed(2)}`
      : `${Math.abs(logData.Shares).toFixed(8)} ${config.ticker} ➡️  ${Math.abs(
        logData.Funds
      )} ${config.currency} @ ${logData.Price.toFixed(2)}`
    } ✊ ${logData.Holding.toFixed(8)} @ ${divide(action.totalInput, logData.Holding).toFixed(2)} 💧 basis ${divide(subtract(action.totalInput, action.realized), logData.Holding).toFixed(2)} 💵 ${action.realized} 💹 ${logData.Profit > 0 ? '+' : ''}${logData.Profit} `
  );

  // save it to the history file--we can copy this into a spreadsheet to make charts :)
  // and this is our preserved investment state in case we kill the app and restart

  const cells = map(logData, (v) => v);
  const line = cells.join("\t");
  fs.appendFileSync(config.history_file, "\n" + line);
};
