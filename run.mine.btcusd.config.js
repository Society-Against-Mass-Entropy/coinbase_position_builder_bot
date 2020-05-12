const apiKeys = require("./api.keys");
module.exports = {
  apps: [
    {
      name: "cpbb_btcusd",
      script: ".",
      watch: ["*.js", "coinbase", "lib"],
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
  ],
};
