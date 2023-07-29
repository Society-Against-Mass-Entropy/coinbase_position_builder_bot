/**
 * sample config that runs BTC-USD every 2 hours but only with posting LIMIT orders
 * NO regular engine MAKER orders are performed
 */
const apiKeys = require('./api.keys');
module.exports = {
  apps: [
    {
      name: 'btcusd_limit',
      script: '.',
      watch: ['*.js', 'coinbase', 'lib'],
      env: {
        NODE_ENV: 'production',
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
        // rebuy logic will place orders at this size until CPBB_REBUY_MAX is reached
        CPBB_REBUY:
          '.0001@4,.0002@6,.0003@8,.0004@10,.0005@12,.001@15,.002@20,.004@25,.008@30,.016@35,.032@40,.064@50,.128@60,.256@70,.512@80,1.024@90',
        // default behavior is on the next action point (if they didn't fill)
        // if CPBB_REBUY_CANCEL is set, this is a number of minutes after the limit order
        // creation timestamp that it will be considered ready to cancel if not filled
        // below is a config to leave the order for a minimum time of 1 day
        // NOTE: the rebuy check/cancel is run on your CPBB_FREQ interval so setting this to
        // 5 minutes with a daily job timer will cancel the order after 1 day, not 5 minutes
        // set to 0 or remove ENV var to have default behavior of canceling on the next
        // action timer
        CPBB_REBUY_CANCEL: 60 * 24 * 2,
        // if there are this many unfilled limit orders remaining on the books, expire them
        // and rebuild the limit order set immediately using the sum total of funds
        // used for all the limit orders that existed, starting with the price at the highest limit value
        // using the rebuy config to create new orders
        // NOTE: if you use this setting, it is recommended that you set it higher than
        // the number of items in your CPBB_REBUY config so it doesn't excessively rebuild
        // the same orders over and over
        CPBB_REBUY_REBUILD: 35,
        // max $ spend on limit resells
        CPBB_RESELL_MAX: 50,
        // minimum order is .0001 BTC ($5 at $50K)
        // rebuy logic will place up orders at this size until CPBB_REBUY_MAX is reached
        CPBB_RESELL:
          '.0001@4,.0002@5,.0003@6,.0004@7,.0005@8,.0006@9,.0007@10,.0008@11,.0009@12,.001@13,.0015@14,.002@15,.004@20,.008@25,.016@30,.032@35,.064@40,.128@45,.256@50,.512@55,1@60,2@65,4@70,8@75,16@80,32@85,64@90,128@95,200@96,200@97,200@98,200@99',
        // when should we cancel limit orders?
        // default behavior is on the next action point (if they didn't fill)
        // if CPBB_REBUY_CANCEL is set, this is a number of minutes after the limit order
        // creation timestamp that it will be considered ready to cancel if not filled
        //  CPBB_RESELL_CANCEL: 60 * 24 * 14,
        // if there are this many unfilled limit orders remaining on the books, expire them
        // and rebuild the limit order set immediately using the sum total of funds
        // used for all the limit orders and starting with the price at the highest limit value
        // using the resell config to create new orders
        // NOTE: if you use this setting, it is recommended that you set it higher than
        // the number of items in your CPBB_RESELL config so it doesn't excessively rebuild
        // the same orders over and over
        CPBB_RESELL_REBUILD: 35,
      },
    },
  ],
};
