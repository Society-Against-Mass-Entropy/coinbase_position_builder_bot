/**
 * buys LTC with BTC at interval (accumulates LTC using BTC)
 * WARNING: I don't know anyone running this. It may have bugs.
 */
const apiKeys = require('./api.keys');
module.exports = {
  apps: [
    {
      name: 'cpbb_ltcbtc',
      script: '.',
      watch: ['*.js', 'coinbase', 'lib'],
      env: {
        NODE_ENV: 'production',
        CPBB_APIPASS: apiKeys.CPBB_APIPASS,
        CPBB_APIKEY: apiKeys.CPBB_APIKEY,
        CPBB_APISEC: apiKeys.CPBB_APISEC,
        CPBB_DRY_RUN: true,
        CPBB_FREQ: '5 */12 * * *',
        CPBB_TICKER: 'LTC',
        CPBB_CURRENCY: 'BTC',
        CPBB_VOL: 0.01, // trading .01 BTC for LTC
        CPBB_APY: 15,
      },
    },
  ],
};
