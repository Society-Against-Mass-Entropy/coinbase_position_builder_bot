const apiKeys = require('./api.keys');
const script = '.';
const watch = ['./index.js', './config.js', 'coinbase/*.js', 'lib/*.js'];

// base environmental variable config for alts
// these operate at a low APY threshold and volume to feed BTC
const baseConfigEnv = {
  NODE_ENV: 'production',
  CPBB_APIPASS: apiKeys.CPBB_APIPASS,
  CPBB_APIKEY: apiKeys.CPBB_APIKEY,
  CPBB_APISEC: apiKeys.CPBB_APISEC,
  CPBB_FREQ: '0 6 * * *',
  CPBB_TICKER: 'TEST',
  CPBB_CURRENCY: 'USD',
  CPBB_VOL: 10,
  CPBB_APY: 20,
  CPBB_RESELL_MAX: 10,
  // resell up to 1000 units of asset @ +5% pump
  CPBB_RESELL: '1000@5',
  CPBB_REBUY_MAX: 10,
  // rebuy up to 1000 units of asset @ -10% dump
  CPBB_REBUY: '1000@10',
  // randomly shift the cron timer by up to 5 minutes
  // to prevent bot detection/manipulation
  CPBB_RANDOM_DELAY: 5,
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
          VERBOSE: false,
          CPBB_FREQ: '02 5 * * *',
          CPBB_TICKER: 'BTC',
          CPBB_VOL: 400,
          CPBB_APY: 100,
          CPBB_RESELL_MAX: 400,
          CPBB_RESELL: '1@10',
          CPBB_REBUY_MAX: 400,
          CPBB_REBUY: '1@10',
        },
      },
    },
    {
      name: 'eth',
      script,
      watch: watch,
      env: {
        ...baseConfigEnv,
        ...{
          CPBB_FREQ: '12 5 * * *',
          CPBB_TICKER: 'ETH',
          CPBB_VOL: 100,
          CPBB_RESELL_MAX: 100,
          CPBB_REBUY_MAX: 100,
        },
      },
    },
    {
      name: 'ltc',
      script,
      watch: watch,
      env: {
        ...baseConfigEnv,
        ...{
          CPBB_FREQ: '22 5 * * *',
          CPBB_TICKER: 'LTC',
        },
      },
    },
    {
      name: 'dash',
      script,
      watch: watch,
      env: {
        ...baseConfigEnv,
        ...{
          CPBB_FREQ: '32 5 * * *',
          CPBB_TICKER: 'DASH',
        },
      },
    },
    {
      name: 'xtz',
      script,
      watch: watch,
      env: {
        ...baseConfigEnv,
        ...{
          CPBB_FREQ: '42 5 * * *',
          CPBB_TICKER: 'XTZ',
        },
      },
    },
    {
      name: 'doge',
      script,
      watch: watch,
      env: {
        ...baseConfigEnv,
        ...{
          CPBB_FREQ: '52 5 * * *',
          CPBB_TICKER: 'DOGE',
        },
      },
    },
    {
      name: 'ada',
      script,
      watch: watch,
      env: {
        ...baseConfigEnv,
        ...{
          CPBB_FREQ: '3 6 * * *',
          CPBB_TICKER: 'ADA',
        },
      },
    },
    {
      name: 'algo',
      script,
      watch: watch,
      env: {
        ...baseConfigEnv,
        ...{
          CPBB_FREQ: '13 6 * * *',
          CPBB_TICKER: 'ALGO',
        },
      },
    },
    {
      name: 'matic',
      script,
      watch: watch,
      env: {
        ...baseConfigEnv,
        ...{
          CPBB_FREQ: '23 6 * * *',
          CPBB_TICKER: 'MATIC',
        },
      },
    },
  ],
};
