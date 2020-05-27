/**
 * buys BTC with LTC at interval (accumulates BTC using LTC)
 */
const apiKeys = require("./api.keys");
module.exports = {
  apps: [
    {
      name: "cpbb_btcltc",
      script: ".",
      watch: ["*.js", "coinbase", "lib"],
      env: {
        NODE_ENV: "production",
        CPBB_APIPASS: apiKeys.CPBB_APIPASS,
        CPBB_APIKEY: apiKeys.CPBB_APIKEY,
        CPBB_APISEC: apiKeys.CPBB_APISEC,
        CPBB_DRY_RUN: true,
        CPBB_FREQ: "5 */12 * * *",
        CPBB_TICKER: "BTC",
        CPBB_CURRENCY: "LTC",
        CPBB_VOL: 1, // trading 1 LTC for BTC
        CPBB_APY: 10,
      },
    },
  ],
};
