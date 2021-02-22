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
        CPBB_FREQ: "3 */2 * * *",
        CPBB_TICKER: "BTC",
        CPBB_CURRENCY: "USD",
        CPBB_VOL: 10,
        CPBB_APY: 5, // sell if over 5% APY
        // place up to 5 maker limit orders on the books after a sell action
        CPBB_REBUY_MAX: 5,
        // maximum dollar value consumed by limit order placements
        CPBB_REBUY_VOL: 10,
        // minimum order is in BTC (.0001, which is $5 at $50K, or $2 at $20K)
        // rebuy logic will place up to CPBB_REBUY_MAX orders at this size until CPBB_REBUY_VOL is reached
        CPBB_REBUY_SIZE: .0001,
        // should the size be doubled at each percentage drop (.e.g .0001, .0002)?
        // acts as a multiplier if you want to just go to .00015 with 1.5
        CPBB_REBUY_MULTIPLIER: 2,
        CPBB_REBUY_AT: -1,
      },
    },
  ],
};
