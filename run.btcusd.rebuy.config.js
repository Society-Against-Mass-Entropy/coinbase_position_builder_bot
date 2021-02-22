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
        CPBB_APY: 10, // sell if over 10% APY
        // MAKER REBUY CONFIG
        // The below section will create the following maker orders after a sell
        // .0001 BTC @ price -1% (as long as bitcoin is under $100K)
        // .0002 BTC @ price -2% (but only if this doesn't bust the $10 max)
        // .0004 BTC @ price -4% (but only if this doesn't bust the $10 max)
        // .0008 BTC @ price -8% (but only if this doesn't bust the $10 max)
        // .0016 BTC @ price -16% (but only if this doesn't bust the $10 max)

        // rebuy logic will place up to CPBB_REBUY_MAX orders
        // at this size (multiplied by CPBB_REBUY_MULTIPLIER) until CPBB_REBUY_VOL is reached
        // using CPBB_REBUY_AT as each drop point
        // place up to 10 maker limit orders on the books after a sell action
        CPBB_REBUY_MAX: 10,
        // maximum dollar value consumed by limit order placements
        CPBB_REBUY_VOL: 10,
        // minimum order is in BTC (.0001, which is $5 at $50K)
        CPBB_REBUY_SIZE: .0001,
        // what should the size be multiplied by each drop point (1 means keep it stable),
        // 2 would set an order of .0001, then .0002, then .0004, etc
        CPBB_REBUY_MULTIPLIER: 1,
        // rebuy at these percentage drop targets (-1%, -2%, etc)
        // note: you have to define at least the number of points in CPBB_REBUY_MAX
        CPBB_REBUY_AT: "-1,-2,-4,-8,-16,-20,-30,-40,-50,-80",
      },
    },
  ],
};
