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
        // VERBOSE: true,
        // testing rebuy--hit it immediately
        CPBB_FREQ: "* * * * *",
        CPBB_TICKER: "BTC",
        CPBB_CURRENCY: "USD",
        CPBB_VOL: 10, // $10
        CPBB_APY: 50, // sell if over 50% APY
        // should the engine only create and manage the limit orders and not make normal accumulation trades
        // useful for testing this feature
        CPBB_REBUY_ONLY: true,
        // place up to 2 maker limit orders on the books after a sell action
        CPBB_REBUY_MAX: 2,
        // maximum dollar value consumed by limit order placements
        CPBB_REBUY_VOL: 50,
        // minimum order is in BTC (.0001, which is $5 at $50K, or $2 at $20K)
        // rebuy logic will place up to CPBB_REBUY_MAX orders at this size until CPBB_REBUY_VOL is reached
        CPBB_REBUY_SIZE: .0001,
        // should the size be doubled at each percentage drop?
        CPBB_REBUY_DOUBLING: true,
        // -0.5% intervals (e.g. -0.05%, -0.01%, -0.15%, -0.2%, -0.25%, -0.3%, -0.35%, -0.4%)
        CPBB_REBUY_AT: -0.05,
      },
    },
  ],
};
