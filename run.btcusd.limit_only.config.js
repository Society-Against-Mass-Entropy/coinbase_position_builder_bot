/**
 * sample config that runs BTC-USD every 2 hours but only with posting LIMIT orders
 * NO regular engine MAKER orders are performed
 */
const apiKeys = require("./api.keys");
module.exports = {
  apps: [
    {
      name: "cpbb_btcusd_limit",
      script: ".",
      watch: ["*.js", "coinbase", "lib"],
      env: {
        NODE_ENV: "production",
        CPBB_APIPASS: apiKeys.CPBB_APIPASS,
        CPBB_APIKEY: apiKeys.CPBB_APIKEY,
        CPBB_APISEC: apiKeys.CPBB_APISEC,
        // VERBOSE: true,
        // every 5 minutes
        CPBB_FREQ: "*/2 * * * *",
        CPBB_TICKER: "BTC",
        CPBB_CURRENCY: "USD",
        CPBB_VOL: 50, // $50 each day
        CPBB_APY: 100, // sell if over 100% APY
        // should the engine only create and manage the limit orders and not make normal accumulation trades
        // useful for testing this feature
        // or for running a bot that only wants to accumulate an asset via dips
        CPBB_REBUY_ONLY: true,
        // maximum dollar value consumed by limit order placements
        CPBB_REBUY_MAX: 50,
        // NOTE: as of 2021-02-22, Coinbase has the following minimum order sizes:
        // BTC minimum order is .0001 ($5 at $50K)
        // ETH minimum order is .001 ($5 at $5K)
        // LTC minimum order is .01 ($5 at $500)
        // DASH minimum order is .01 ($5 at $500)
        // etc: try to make absurdly small limit orders via coinbase UI to get an error with the limit
        // these could change in the future and allow you to make smaller size rebuy trades
        // rebuy logic will place up to  orders at this size until CPBB_REBUY_MAX is reached
        CPBB_REBUY_SIZE: ".0001,.0001,.0002,.0002,.0003,.0003,.0004,.0004,.0005,.0005",
        // rebuy at these percentage drop targets (-1%, -2%, etc)
        // note: you have to define at least the number of points in CPBB_REBUY_SIZE
        CPBB_REBUY_AT: "-.01,-2,-4,-5,-8,-10,-12,-25,-50,-80",
      },
    },
  ],
};
