const apiKeys = require('./api.keys');
const script = '.';
const watch = ['./index.js', './config.js', 'coinbase/*.js', 'lib/*.js'];

// base environmental variable config for alts
// these operate at a low APY threshold and volume to feed BTC
const baseConfigEnv = {
  NODE_ENV: 'production',
  CPBB_APIKEY: apiKeys.CPBB_APIKEY,
  CPBB_APISEC: apiKeys.CPBB_APISEC,
  CPBB_FREQ: '0 6 * * *',
  CPBB_TICKER: 'TEST',
  CPBB_CURRENCY: 'USD',
  CPBB_VOL: 10,
  CPBB_APY: 10,
  CPBB_RESELL_MAX: 10,
  // resell up to 1000 units of asset @ +5% pump
  CPBB_RESELL: '1000@8',
  CPBB_REBUY_MAX: 10,
  // rebuy up to 1000 units of asset @ -10% dump
  CPBB_REBUY: '1000@10',
  // randomly shift the cron timer by up to 5 minutes
  // to prevent bot detection/manipulation
  CPBB_RANDOM_DELAY: 0,
};
module.exports = {
  apps: [
    {
      name: 'btc',
      script,
      watch,
      env: {
        ...baseConfigEnv,
        ...{
          VERBOSE: true,
          // every hour (20K will last about 8 days)
          CPBB_FREQ: '30 * * * *',
          CPBB_TICKER: 'BTC',
          CPBB_CURRENCY: 'USDC',
          CPBB_VOL: 10,
          // set APY super crazy high so we will never sell as an initial action
          // TODO: this could be set as a config flag
          CPBB_APY: 100000,
          // reset whole amount plus fees (this gives us the initial dollars back and we keep the remainder BTC)
          CPBB_RESELL_MAX: 10.5,
          CPBB_RESELL: '10@10',
        },
      },
    },
  ],
};
