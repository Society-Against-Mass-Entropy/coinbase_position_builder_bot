const apiKeys = require('./api.keys')
module.exports = {
  apps: [{
    name: "cpbb_ltcusd",
    script: '.',
    watch: ['*.js','coinbase','lib'],
    env: {
      NODE_ENV: "production",
      CPBB_APIPASS: apiKeys.CPBB_APIPASS,
      CPBB_APIKEY: apiKeys.CPBB_APIKEY,
      CPBB_APISEC: apiKeys.CPBB_APISEC,
      // 12:05am + 12:05pm (2x daily)
      CPBB_FREQ: "5 */12 * * *",
      CPBB_TICKER: "LTC",
      CPBB_CURRENCY: "USD",
      CPBB_VOL: 10,
      CPBB_APY: 15,
    }
  }]
};
