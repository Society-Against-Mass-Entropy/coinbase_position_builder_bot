/**
 * sample config that runs BTC-USD every 2 hours but only with posting LIMIT orders
 * NO regular engine MAKER orders are performed
 */
const apiKeys = require('./api.keys');
module.exports = {
  apps: [
    {
      name: 'cpbb_btcusd_limit',
      script: '.',
      watch: ['*.js', 'coinbase', 'lib'],
      env: {
        NODE_ENV: 'production',
        CPBB_APIPASS: apiKeys.CPBB_APIPASS,
        CPBB_APIKEY: apiKeys.CPBB_APIKEY,
        CPBB_APISEC: apiKeys.CPBB_APISEC,
        // VERBOSE: true,
        // every 2 minutes (for testing)
        // NOTE: if you run this in a bear market, it can spend up to CPBB_REBUY_MAX every 2 minutes!
        // this config example is just for testing!
        CPBB_FREQ: '*/2 * * * *',
        CPBB_TICKER: 'BTC',
        CPBB_CURRENCY: 'USD',
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
        CPBB_REBUY_SIZE:
          '.0001,.0001,.0002,.0002,.0003,.0003,.0004,.0004,.0005,.0005',
        // rebuy at these percentage drop targets
        // note: you have to define at least the number of points in CPBB_REBUY_SIZE
        // if the percentage drop is too low, it could cause you to lose profit in fees
        CPBB_REBUY_AT: '-4,-6,-8,-10,-12,-14,-16,-20,-50,-80', // when should we cancel limit orders?
        // default behavior is on the next action point (if they didn't fill)
        // if CPBB_REBUY_CANCEL is set, this is a number of minutes after the limit order
        // creation timestamp that it will be considered ready to cancel if not filled
        // below is a config to leave the order for a minimum time of 1 day
        // NOTE: the rebuy check/cancel is run on your CPBB_FREQ interval so setting this to
        // 5 minutes with a daily job timer will cancel the order after 1 day, not 5 minutes
        // set to 0 or remove ENV var to have default behavior of canceling on the next
        // action timer
        CPBB_REBUY_CANCEL: 60 * 24 * 2,
        // if there are twelve unfilled limit orders remaining on the books, expire them
        // and rebuild the limit order set immediately using the sum total of funds
        // used for all the limit orders that existed, starting with the price at the highest limit value
        // using the rebuy config to create new orders
        // NOTE: if you use this setting, it is recommended that you set it higher than
        // the number of items in your CPBB_REBUY_AT config so it doesn't excessively rebuild
        // the same oders over and over
        CPBB_REBUY_REBUILD: 12,
      },
    },
  ],
};
