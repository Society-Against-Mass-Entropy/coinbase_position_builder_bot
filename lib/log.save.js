const config = require('../config');
const { add, divide, multiply, subtract } = require('./math');
const fs = require('fs');
const logOutput = require('./log.output');
const map = require('lodash.map');
const memory = require('./memory');
const numFix = require('./number.fix');

/**
 * Save the transaction to our logs and interface
 * @param {object} data {action, order} collection so far (given from previous task)
 */
module.exports = ({ action, order }) => {
  // update last log in memory
  const sold = order.side === 'sell';
  // correct funds to executed values (including fees)
  action.funds = sold
    ? multiply(-1, subtract(order.executed_value, order.fill_fees))
    : add(order.executed_value, order.fill_fees);
  action.realized = add(
    memory.lastLog.Realized,
    !sold ? 0 : multiply(action.funds, -1)
  );

  // rebuys are special in that they are undo-ing a premature sell (buying the dip back)
  // for this reason, we deduct the rebought amount from the Realized (we re-used the captured cash)
  // and prevent adding the rebought amount to the TotalInput.
  // by removing it from the Realized pile, we don't need to add it to the TotalInput
  // for our accounting to be correct.
  if (action.isRebuy) {
    // remove from Realized pile
    action.realized = subtract(action.realized, action.funds);
    action.totalInput = memory.lastLog.TotalInput || 0;
  } else {
    action.totalInput = add(
      memory.lastLog.TotalInput,
      !sold ? action.funds : 0
    );
  }

  action.totalValue = add(action.endValue, action.realized);
  action.liquidValue = subtract(action.totalValue, action.totalInput);
  const logData = {
    Time: action.dateNow.toISOString(),
    Price: action.price.toFixed(2),
    Holding: numFix(action.currentHolding, 8),
    Value: numFix(action.value, 2),
    Funds: action.funds,
    Shares: multiply(order.filled_size, !sold > 0 ? 1 : -1),
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
      '%',
    ID: order.id,
  };
  memory.lastLog = logData;
  // log it to the terminal
  logOutput(logData);

  // save it to the history file--we can copy this into a spreadsheet to make charts :)
  // and this is our preserved investment state in case we kill the app and restart

  const cells = map(logData, v => v);
  const line = cells.join('\t');
  fs.appendFileSync(config.history_file, '\n' + line);
};
