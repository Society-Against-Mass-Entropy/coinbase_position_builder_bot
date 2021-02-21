const config = require('../config');
const log = require('./log');
const { add, divide, subtract } = require('mathjs');
const moment = require('moment');


module.exports = (logData) => {
  const currentHolding = add(logData.Holding, logData.Shares);
  const emoji =
    (process.env.CPBB_DRY_RUN ? "🚫 " : "") + (logData.Funds > 0 ? "💸" : "🤑");

  const costBasis = logData.TotalInput ? divide(logData.TotalInput, currentHolding).toFixed(2) : 0;
  const liquidBasis = logData.TotalInput ? divide(subtract(logData.TotalInput, logData.Realized), currentHolding).toFixed(2) : 0;
  const buyBelow = logData.Target ? divide(logData.Target, currentHolding).toFixed(2) : Infinity;
  log.now(
    `${emoji} ${moment(logData.Time).local().format()} ${
    logData.Funds > 0
      ? `${Math.abs(logData.Funds)} ${config.currency} ➡️  ${Math.abs(
        logData.Shares
      ).toFixed(8)} ${config.ticker} @ ${logData.Price.toFixed(2)}`
      : `${Math.abs(logData.Shares).toFixed(8)} ${config.ticker} ➡️  ${Math.abs(
        logData.Funds
      )} ${config.currency} @ ${logData.Price.toFixed(2)}`
    } ✊ ${currentHolding.toFixed(8)} @ ${costBasis} 💧 gain ${logData.Liquid} 💧 basis ${liquidBasis} 💵 ${logData.Realized} 💹 ${logData.Profit > 0 ? '+' : ''}${logData.Profit} 💸 <${buyBelow}`
  );
}
