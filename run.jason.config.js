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
  CPBB_CURRENCY: 'USDC',
  CPBB_VOL: 10,
  CPBB_APY: 15,
  CPBB_RESELL_MAX: 10,
  // resell up to 1000 units of asset @ +5% pump
  CPBB_RESELL: '1000@10',
  CPBB_REBUY_MAX: 10,
  // rebuy up to 1000 units of asset @ -20% dump
  CPBB_REBUY: '1000@20',
  // randomly shift the cron timer by up to 5 minutes
  // to prevent bot detection/manipulation
  CPBB_RANDOM_DELAY: 5,
  VERBOSE: false,
};
module.exports = {
  apps: [
    // {
    //   name: 'algo',
    //   script,
    //   watch: watch,
    //   env: {
    //     ...baseConfigEnv,
    //     ...{
    //       // CPBB_FREQ: '19 7 * * *',
    //       CPBB_FREQ: '10 5 * * *',
    //       CPBB_TICKER: 'ALGO',
    //       CPBB_APY: 3,
    //     },
    //   },
    // },
    {
      name: 'btc',
      script,
      watch,
      env: {
        ...baseConfigEnv,
        CPBB_APY_DYNAMIC: '80@5000-3@1000000',
        CPBB_FREQ: '20 5 * * *',
        CPBB_REBUY_MAX: 100,
        CPBB_REBUY: '1@12',
        CPBB_RESELL_MAX: 100,
        CPBB_RESELL: '1@10',
        CPBB_TICKER: 'BTC',
        CPBB_VOL: 100,
      },
    },
    {
      name: 'doge',
      script,
      watch: watch,
      env: {
        ...baseConfigEnv,
        ...{
          CPBB_RESELL: '1000@20',
          CPBB_REBUY: '1000@25',
          CPBB_RANDOM_DELAY: 0,
          // CPBB_FREQ: '15 7 * * *',
          CPBB_FREQ: '34 10 * * *',
          CPBB_TICKER: 'DOGE',
        },
      },
    },
    // {
    //   name: 'dot',
    //   script,
    //   watch: watch,
    //   env: {
    //     ...baseConfigEnv,
    //     ...{
    //       // CPBB_FREQ: '33 9 * * *',
    //       CPBB_FREQ: '50 5 * * *',
    //       CPBB_TICKER: 'DOT',
    //       CPBB_APY: 3,
    //     },
    //   },
    // },
    {
      name: 'eth',
      script,
      watch: watch,
      env: {
        ...baseConfigEnv,
        ...{
          // CPBB_FREQ: '7 7 * * *',
          CPBB_FREQ: '0 6 * * *',
          CPBB_TICKER: 'ETH',
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
          // CPBB_FREQ: '9 7 * * *',
          CPBB_FREQ: '10 6 * * *',
          CPBB_TICKER: 'LTC',
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
          // CPBB_FREQ: '13 7 * * *',
          CPBB_FREQ: '30 6 * * *',
          CPBB_TICKER: 'XTZ',
        },
      },
    },
  ],
};
