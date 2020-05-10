/**
 * buys LTC with BTC at interval (accumulates LTC using BTC)
 */
const apiKeys = require('./api.keys')
module.exports = {
  apps: [{
    name: "cpbb_ltcbtc",
    script: '.',
    watch: ['*.js','coinbase','lib'],
    env: {
      NODE_ENV: "production",
      CPBB_APIPASS: apiKeys.CPBB_APIPASS,
      CPBB_APIKEY: apiKeys.CPBB_APIKEY,
      CPBB_APISEC: apiKeys.CPBB_APISEC,
      CPBB_DRY_RUN: true,
      CPBB_FREQ: "5 */12 * * *",
      CPBB_TICKER: "LTC",
      CPBB_CURRENCY: "BTC",
      CPBB_VOL: .01, // trading .01 BTC for LTC
      CPBB_APY: 15,
    }
  }]
};
