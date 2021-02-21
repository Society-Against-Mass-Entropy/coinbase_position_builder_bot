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
        CPBB_DRY_RUN: true,
        // every hour at the 5th minute (dry run testing)
        CPBB_FREQ: "* * * * *",
        CPBB_TICKER: "BTC",
        CPBB_CURRENCY: "USD",
        CPBB_VOL: 100, // $100
        CPBB_APY: 1, // sell if over 1% APY (trying to trigger this quickly)
        // new, experimental vars
        CPBB_REBUY_ORDERS: 5, // place 5 maker limit orders on the books
        CPBB_REBUY_VOL: 10, // $10 each limit buy
        CPBB_REBUY_AT: -0.5, // -0.5% intervals (e.g. -0.5%, -1%, -1.5%, -2%, -2.5%, -3%, -3.5%, -4%)
      },
    },
  ],
};
