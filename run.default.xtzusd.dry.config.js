const apiKeys = require("./api.keys");
module.exports = {
  apps: [
    {
      name: "cpbb_xtzusd",
      script: ".",
      watch: ["*.js", "coinbase", "lib"],
      env: {
        NODE_ENV: "production",
        CPBB_APIPASS: apiKeys.CPBB_APIPASS,
        CPBB_APIKEY: apiKeys.CPBB_APIKEY,
        CPBB_APISEC: apiKeys.CPBB_APISEC,
        CPBB_DRY_RUN: true,
        // testing every minute
        CPBB_FREQ: "* * * * *",
        CPBB_TICKER: "XTZ",
        CPBB_CURRENCY: "USD",
        CPBB_VOL: 10,
        CPBB_APY: 15,
      },
    },
  ],
};
