const fs = require('fs');
const log = require('./lib/log');
const pjson = require('./package');

const { divide, multiply } = require('./lib/math');
const testMode = process.env.CPBB_TEST;
const config = {
  api: testMode
    ? 'https://api-public.sandbox.pro.coinbase.com'
    : 'https://api.pro.coinbase.com',
  dry: process.env.CPBB_DRY_RUN === 'true',
  // default run once per 12 hours at the 5th minute (crontab syntax)
  freq: process.env.CPBB_FREQ || '5 */12 * * *',
  // default $10 action
  vol: Number(process.env.CPBB_VOL || 10),
  // default 15% APY target (we aim to shave off any excess from this gain)
  apy: divide(process.env.CPBB_APY || 15, 100),
  rebuy: {
    // ms after limit order placed before it is able to be canceled due to not filling
    cancel: Number(process.env.CPBB_REBUY_CANCEL || 0) * 60000,
    drops: (process.env.CPBB_REBUY_AT || '')
      .split(',')
      .map(p => (p ? divide(multiply(Math.abs(p), -1), 100) : null))
      .filter(i => i),
    max: Number(process.env.CPBB_REBUY_MAX || 0),
    only: process.env.CPBB_REBUY_ONLY === 'true',
    rebuild: Number(process.env.CPBB_REBUY_REBUILD || 0),
    sizes: (process.env.CPBB_REBUY_SIZE || '')
      .split(',')
      .map(s => (s ? Number(s) : null))
      .filter(i => i),
  },
  // if the trading pair ordering doesn't exist (e.g. BTC-LTC)
  // we have to reverse our logic to run from the trading pair that does exist (e.g. LTC-BTC)
  reverse: false,
  // default ticker currency is BTC
  ticker: process.env.CPBB_TICKER || 'BTC',
  // default home currency is USD
  currency: process.env.CPBB_CURRENCY || 'USD',
  sleep: {
    product: testMode ? 0 : 500,
    rebuyCheck: testMode ? 0 : 1000,
    rebuyPost: testMode ? 0 : 1000,
    cancelOrder: testMode ? 0 : 500,
  },
  pjson,
};
config.productID = `${config.ticker}-${config.currency}`;
let historyName = config.productID;
// currenly, we only support reversing BTC orders to support ticker pairs that don't exist
if (
  config.ticker === 'BTC' &&
  !['USD', 'USDC', 'GBP', 'EUR'].includes(config.currency)
) {
  config.reverse = true;
  historyName = config.productID; // still save as history.BTC-LTC...
  // ask coinbase for LTCBTC pair
  config.productID = `${config.currency}-${config.ticker}`;
  log.zap(`running in reverse logic mode to support inverted ticker`);
}
let historySubName = '';
if (testMode) historySubName = '.sandbox';
if (process.env.CPBB_DRY_RUN) historySubName = '.dryrun';
config.history_file = `${__dirname}/data/history.${historyName}${historySubName}.tsv`;
log.debug(config.history_file);
if (!fs.existsSync(config.history_file)) {
  // copy the template
  log.zap('creating log file from template', config.history_file);
  fs.copyFileSync(
    `${__dirname}/data/template.history.tsv`,
    config.history_file
  );
}
config.maker_file = `${__dirname}/data/maker.orders.${historyName}${historySubName}.json`;
log.debug(config.maker_file);
if (!fs.existsSync(config.maker_file)) {
  // copy the template
  log.zap('creating maker file from template', config.maker_file);
  fs.copyFileSync(
    `${__dirname}/data/template.maker.orders.json`,
    config.maker_file
  );
}
module.exports = config;
