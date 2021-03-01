const config = require('../config');
const log = require('./log');
const { divide, subtract } = require('./math');
const moment = require('moment');

module.exports = data => {
  const currentHolding = data.Holding + data.Shares;
  const emoji = (config.dry ? '🚫 ' : '') + (data.Funds > 0 ? '💸' : '🤑');

  const costBasis = data.TotalInput
    ? divide(data.TotalInput, currentHolding)
    : 0;
  const liquidBasis = data.TotalInput
    ? divide(subtract(data.TotalInput, data.Realized), currentHolding)
    : 0;
  const buyBelow = data.Target
    ? divide(data.Target, currentHolding).toFixed(2)
    : Infinity;
  log.now(
    `${emoji} ${moment(data.Time).local().format()} ${
      data.Funds > 0
        ? `${Math.abs(data.Funds)} ${config.currency} ➡️  ${Math.abs(
            data.Shares
          ).toFixed(8)} ${config.ticker} @ ${data.Price}`
        : `${Math.abs(data.Shares).toFixed(8)} ${config.ticker} ➡️  ${Math.abs(
            data.Funds
          )} ${config.currency} @ ${data.Price}`
    } ✊ ${currentHolding.toFixed(8)} @ ${costBasis.toFixed(
      2
    )} 💧 gain ${data.Liquid.toFixed(2)} 💧 basis ${liquidBasis.toFixed(
      2
    )} 💵 ${data.Realized.toFixed(2)} 💹 ${data.Profit > 0 ? '+' : ''}${
      data.Profit
    } 💸 <${buyBelow}`
  );
};
