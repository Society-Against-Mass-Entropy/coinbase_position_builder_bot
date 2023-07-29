const apiKeys = require('./api.keys');
const script = '.';
const watch = ['./index.js', './config.js', 'coinbase/*.js', 'lib/*.js'];

module.exports = {
  apps: [
    {
      name: 'btc',
      script,
      watch,
      env: {
        CPBB_APIKEY: apiKeys.CPBB_APIKEY,
        CPBB_APISEC: apiKeys.CPBB_APISEC,
        CPBB_APY_DYNAMIC: '100@5000-10@1000000',
        CPBB_CURRENCY: 'USDC',
        CPBB_FREQ: '38 7 * * *',
        CPBB_RANDOM_DELAY: 0,
        CPBB_REBUY_MAX: 100,
        CPBB_REBUY: '1@12',
        CPBB_RESELL_MAX: 100,
        CPBB_RESELL: '1@8',
        CPBB_TICKER: 'BTC',
        CPBB_VOL: 100,
        NODE_ENV: 'production',
        VERBOSE: false,
      },
    },
  ],
};
