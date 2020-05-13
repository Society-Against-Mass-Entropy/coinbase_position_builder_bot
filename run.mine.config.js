const apiKeys = require("./api.keys");
const script = ".";
const watch = ["*.js", "coinbase", "lib"];
// https://crontab.guru/#35_12_*_*_6
const weekly = "35 12 * * 6";
module.exports = {
  apps: [
    {
      name: "cpbb_btcusd",
      script,
      watch,
      env: {
        NODE_ENV: "production",
        CPBB_APIPASS: apiKeys.CPBB_APIPASS,
        CPBB_APIKEY: apiKeys.CPBB_APIKEY,
        CPBB_APISEC: apiKeys.CPBB_APISEC,
        CPBB_FREQ: "35 */2 * * *",
        CPBB_TICKER: "BTC",
        CPBB_CURRENCY: "USD",
        CPBB_VOL: 20,
        CPBB_APY: 15,
      },
    },
    {
      name: "cpbb_ethusd",
      script,
      watch: watch,
      env: {
        NODE_ENV: "production",
        CPBB_APIPASS: apiKeys.CPBB_APIPASS,
        CPBB_APIKEY: apiKeys.CPBB_APIKEY,
        CPBB_APISEC: apiKeys.CPBB_APISEC,
        CPBB_FREQ: "30 12 * * 6",
        CPBB_TICKER: "ETH",
        CPBB_CURRENCY: "USD",
        CPBB_VOL: 25,
        CPBB_APY: 12,
      },
    },
    {
      name: "cpbb_xtzusd",
      script,
      watch: watch,
      env: {
        NODE_ENV: "production",
        CPBB_APIPASS: apiKeys.CPBB_APIPASS,
        CPBB_APIKEY: apiKeys.CPBB_APIKEY,
        CPBB_APISEC: apiKeys.CPBB_APISEC,
        CPBB_FREQ: "20 12 * * 6",
        CPBB_TICKER: "XTZ",
        CPBB_CURRENCY: "USD",
        CPBB_VOL: 25,
        CPBB_APY: 12,
      },
    }
  ],
};
