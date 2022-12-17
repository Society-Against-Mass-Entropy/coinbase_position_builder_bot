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
          // CPBB_FREQ: '5 7 * * *',
          CPBB_FREQ: '2 5 * * *',
          CPBB_TICKER: 'BTC',
          CPBB_VOL: 400,
          // calculate Target APY rate based on market price
          // where rate is 100% APY target when price <= $10K
          // and rate approaches 10% APY and stabilizes there when price passes $1M
          // calculates as a parabolic decay to mimic adoption S curve
          // note: CPBB_APY_DYNAMIC overrides CPBB_APY
          CPBB_APY_DYNAMIC: '100@5000-10@1000000',
          CPBB_RESELL_MAX: 400,
          CPBB_RESELL: '1@8',
          CPBB_REBUY_MAX: 400,
          CPBB_REBUY: '1@12',
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
          // CPBB_FREQ: '7 7 * * *',
          CPBB_FREQ: '12 5 * * *',
          CPBB_TICKER: 'ETH',
          CPBB_VOL: 50,
          CPBB_RESELL_MAX: 50,
          CPBB_REBUY_MAX: 50,
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
          CPBB_FREQ: '22 5 * * *',
          CPBB_TICKER: 'LTC',
        },
      },
    },
    // {
    //   name: 'dash',
    //   script,
    //   watch: watch,
    //   env: {
    //     ...baseConfigEnv,
    //     ...{
    //       // CPBB_FREQ: '11 7 * * *',
    //       CPBB_FREQ: '32 5 * * *',
    //       CPBB_APY: 5,
    //       CPBB_TICKER: 'DASH',
    //     },
    //   },
    // },
    // {
    //   name: 'xtz',
    //   script,
    //   watch: watch,
    //   env: {
    //     ...baseConfigEnv,
    //     ...{
    //       // CPBB_FREQ: '13 7 * * *',
    //       CPBB_FREQ: '42 5 * * *',
    //       CPBB_TICKER: 'XTZ',
    //     },
    //   },
    // },
    // {
    //   name: 'doge',
    //   script,
    //   watch: watch,
    //   env: {
    //     ...baseConfigEnv,
    //     ...{
    //       // CPBB_FREQ: '15 7 * * *',
    //       CPBB_FREQ: '52 5 * * *',
    //       CPBB_TICKER: 'DOGE',
    //     },
    //   },
    // },
    // {
    //   name: 'ada',
    //   script,
    //   watch: watch,
    //   env: {
    //     ...baseConfigEnv,
    //     ...{
    //       // CPBB_FREQ: '17 7 * * *',
    //       CPBB_FREQ: '3 6 * * *',
    //       CPBB_APY: 5,
    //       CPBB_TICKER: 'ADA',
    //     },
    //   },
    // },
    // {
    //   name: 'algo',
    //   script,
    //   watch: watch,
    //   env: {
    //     ...baseConfigEnv,
    //     ...{
    //       // CPBB_FREQ: '19 7 * * *',
    //       CPBB_FREQ: '27 9 * * *',
    //       CPBB_APY: 5,
    //       CPBB_TICKER: 'ALGO',
    //     },
    //   },
    // },
    // {
    //   name: 'matic',
    //   script,
    //   watch: watch,
    //   env: {
    //     ...baseConfigEnv,
    //     ...{
    //       // CPBB_FREQ: '21 7 * * *',
    //       CPBB_FREQ: '23 6 * * *',
    //       CPBB_APY: 5,
    //       CPBB_TICKER: 'MATIC',
    //     },
    //   },
    // },
    // {
    //   name: 'dot',
    //   script,
    //   watch: watch,
    //   env: {
    //     ...baseConfigEnv,
    //     ...{
    //       // CPBB_FREQ: '33 9 * * *',
    //       CPBB_FREQ: '33 6 * * *',
    //       CPBB_APY: 5,
    //       CPBB_TICKER: 'DOT',
    //     },
    //   },
    // },
  ],
};
