const apiKeys = require("./api.keys");
const script = ".";
const watch = ["*.js", "coinbase", "lib"];
module.exports = {
  apps: [
    {
      name: "cpbb_btcusd",
      script,
      watch,
      env: {
        VERBOSE: true,
        NODE_ENV: "production",
        CPBB_APIPASS: apiKeys.CPBB_APIPASS,
        CPBB_APIKEY: apiKeys.CPBB_APIKEY,
        CPBB_APISEC: apiKeys.CPBB_APISEC,
        CPBB_FREQ: "35 */2 * * *",
        CPBB_TICKER: "BTC",
        CPBB_CURRENCY: "USD",
        CPBB_VOL: 20,
        CPBB_APY: 12,
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
        CPBB_FREQ: "34 12 * * 6",
        CPBB_TICKER: "ETH",
        CPBB_CURRENCY: "USD",
        CPBB_VOL: 25,
        CPBB_APY: 10,
      },
    },
    // {
    //   // buy bitcoin with litecoin
    //   name: "cpbb_btcltc",
    //   script,
    //   watch: watch,
    //   env: {
    //     NODE_ENV: "production",
    //     CPBB_APIPASS: apiKeys.CPBB_APIPASS,
    //     CPBB_APIKEY: apiKeys.CPBB_APIKEY,
    //     CPBB_APISEC: apiKeys.CPBB_APISEC,
    //     CPBB_FREQ: "36 12 * * *",
    //     CPBB_DRY_RUN: true,
    //     CPBB_TICKER: "BTC",
    //     CPBB_CURRENCY: "LTC",
    //     CPBB_VOL: 1,
    //     CPBB_APY: 5,
    //   },
    // }
  ],
};
