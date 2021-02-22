/**
 * sample config that runs BTC-USD every 2 hours but only with posting LIMIT orders
 * NO regular engine MAKER orders are performed
 */
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
        // run at 5:03 am daily
        CPBB_FREQ: "3 5 * * *",
        CPBB_TICKER: "BTC",
        CPBB_CURRENCY: "USD",
        CPBB_VOL: 50, // $50 each day
        CPBB_APY: 100, // sell if over 100% APY
        // should the engine only create and manage the limit orders and not make normal accumulation trades
        // useful for testing this feature
        // or for running a bot that only wants to accumulate an asset via dips
        CPBB_REBUY_ONLY: true,
        // place up to 5 maker limit orders on the books after a sell action
        CPBB_REBUY_MAX: 5,
        // maximum dollar value consumed by limit order placements
        CPBB_REBUY_VOL: 50,
        // minimum order is in BTC (.0001, which is $5 at $50K)
        // minimum order is in ETH (.001, which is $5 at $5K)
        // minimum order is in LTC (.01, which is $5 at $500)
        // rebuy logic will place up to CPBB_REBUY_MAX orders at this size until CPBB_REBUY_VOL is reached
        CPBB_REBUY_SIZE: .0001,
        // should the size be doubled (or otherwise multiplied) at each percentage drop (.e.g .0001, .0002)?
        // acts as a multiplier if you want to just go to .00015 with 1.5
        CPBB_REBUY_MULTIPLIER: 1.5,
        // rebuy at these percentage drop targets (-1%, -2%, etc)
        // note: you have to define at least the number of points in CPBB_REBUY_MAX
        CPBB_REBUY_AT: "-1,-2,-4,-8,-16,-20,-30,-40,-50,-80",
      },
    },
  ],
};
