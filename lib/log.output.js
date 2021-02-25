const config = require('../config');
const log = require('./log');
const { divide, subtract } = require('./math');
const moment = require('moment');

module.exports = (logData) => {
  const currentHolding = logData.Holding + logData.Shares;
  const emoji =
    (config.dry ? "🚫 " : "") + (logData.Funds > 0 ? "💸" : "🤑");

  const costBasis = logData.TotalInput ? divide(logData.TotalInput, currentHolding) : 0;
  const liquidBasis = logData.TotalInput ? divide(subtract(logData.TotalInput, logData.Realized), currentHolding).toFixed(2) : 0;
  const buyBelow = logData.Target ? divide(logData.Target, currentHolding).toFixed(2) : Infinity;
  log.now(
    `${emoji} ${moment(logData.Time).local().format()} ${
    logData.Funds > 0
      ? `${Math.abs(logData.Funds)} ${config.currency} ➡️  ${Math.abs(
        logData.Shares
      ).toFixed(8)} ${config.ticker} @ ${logData.Price}`
      : `${Math.abs(logData.Shares).toFixed(8)} ${config.ticker} ➡️  ${Math.abs(
        logData.Funds
      )} ${config.currency} @ ${logData.Price}`
    } ✊ ${currentHolding.toFixed(8)} @ ${costBasis.toFixed(2)} 💧 gain ${logData.Liquid.toFixed(2)} 💧 basis ${liquidBasis} 💵 ${logData.Realized.toFixed(2)} 💹 ${logData.Profit > 0 ? '+' : ''}${logData.Profit} 💸 <${buyBelow}`
  );
}
