const apiKeys = require("./api.keys");
const script = ".";
const watch = ["./index.js", "./config.js", "coinbase/*.js", "lib/*.js"];
module.exports = {
  apps: [
    {
      // CPBB_FREQ="35 */4 * * *" CPBB_VOL=50 CPBB_APY=15 node project.forward.js
      name: "cpbb_btcusd",
      script,
      watch,
      env: {
        // VERBOSE: false,
        NODE_ENV: "production",
        CPBB_APIPASS: apiKeys.CPBB_APIPASS,
        CPBB_APIKEY: apiKeys.CPBB_APIKEY,
        CPBB_APISEC: apiKeys.CPBB_APISEC,
        CPBB_FREQ: "35 */4 * * *",
        CPBB_TICKER: "BTC",
        CPBB_CURRENCY: "USD",
        CPBB_VOL: 50,
        CPBB_APY: 20,
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
        CPBB_VOL: 50,
        CPBB_APY: 20,
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
