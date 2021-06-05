const config = require('../config');
const log = require('./log');
const { divide, subtract } = require('./math');
const moment = require('moment');
// const getAPY = require('./getAPY');
const dollarize = val => {
  const valStr = val.toFixed(2).replace('.00', '');
  let symbol = '';
  if (config.currency === 'USD') symbol = '$';
  return `${symbol}${valStr}`;
};
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
    ? subtract(divide(data.Target, currentHolding), config.vol).toFixed(2)
    : Infinity;
  log.now(
    `${emoji} ${moment(data.Time).local().format()} ${
      data.Funds > 0
        ? `${dollarize(Math.abs(data.Funds))} ➡️  ${Math.abs(
            data.Shares
          ).toFixed(8)} ${config.ticker} @${data.Price}`
        : `${Math.abs(data.Shares).toFixed(8)} ${config.ticker} ➡️  ${dollarize(
            Math.abs(data.Funds)
          )} @${data.Price}`
    } ✊ ${currentHolding.toFixed(8)} @${costBasis.toFixed(2)} =${dollarize(
      data.TotalInput
    )}` +
      // ` (${multiply(
      //   getAPY({
      //     totalInput: data.TotalInput,
      //     endValue: multiply(data.Price, currentHolding),
      //     dateNow: new Date(data.Time),
      //   }),
      //   100
      // ).toFixed(2)}% APY)`+
      ` 💧 gain ${data.Liquid.toFixed(2)}, basis ${liquidBasis.toFixed(
        2
      )} 💵 ${data.Realized.toFixed(2)} 💹 ${data.Profit > 0 ? '+' : ''}${
        data.Profit || '0'
      } 💸 <${buyBelow}`
  );
};
