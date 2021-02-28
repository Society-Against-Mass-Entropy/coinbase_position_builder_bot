const config = require("../config");
const { add, divide, multiply, subtract } = require("./math");
const fs = require("fs");
const logOutput = require("./log.output");
const map = require("lodash.map");
const memory = require("./memory");
const numFix = require("./number.fix");

/**
 * Save the transaction to our logs and interface
 * @param {object} data {action, response} collection so far (given from previous task)
 */
module.exports = data => {
  const { action, response } = data;
  // update last log in memory
  const sold = response.side === "sell";
  // correct funds to executed values (including fees)
  action.funds = sold
    ? multiply(-1, subtract(response.executed_value, response.fill_fees))
    : add(response.executed_value, response.fill_fees);
  action.realized = add(
    memory.lastLog.Realized,
    !sold ? 0 : multiply(action.funds, -1)
  );
  action.totalInput = add(memory.lastLog.TotalInput, !sold ? action.funds : 0);
  action.totalValue = add(action.endValue, action.realized);
  action.liquidValue = subtract(action.totalValue, action.totalInput);
  const logData = {
    Time: action.dateNow.toISOString(),
    Price: action.price.toFixed(2),
    Holding: numFix(action.currentHolding, 8),
    Value: numFix(action.value, 2),
    Funds: action.funds,
    Shares: multiply(response.filled_size, !sold > 0 ? 1 : -1),
    PeriodRate: action.periodRate,
    ExpectedGain: action.expectedGain,
    TotalInput: action.totalInput,
    Target: action.target,
    Diff: action.diff,
    EndValue: action.endValue,
    Realized: action.realized,
    TotalValue: action.totalValue,
    Liquid: action.liquidValue,
    Profit:
      multiply(divide(action.liquidValue, action.totalInput), 100).toFixed(2) +
      "%",
    ID: response.id,
  };
  memory.lastLog = logData;
  // log it to the terminal
  logOutput(logData);

  // save it to the history file--we can copy this into a spreadsheet to make charts :)
  // and this is our preserved investment state in case we kill the app and restart

  const cells = map(logData, v => v);
  const line = cells.join("\t");
  fs.appendFileSync(config.history_file, "\n" + line);
};
