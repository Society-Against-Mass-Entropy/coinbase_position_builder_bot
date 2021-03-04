const apiKeys = require('./api.keys');
module.exports = {
  apps: [
    {
      name: 'btcusd',
      script: '.',
      watch: ['*.js', 'coinbase', 'lib'],
      env: {
        NODE_ENV: 'production',
        CPBB_APIPASS: apiKeys.CPBB_APIPASS,
        CPBB_APIKEY: apiKeys.CPBB_APIKEY,
        CPBB_APISEC: apiKeys.CPBB_APISEC,
        // VERBOSE: true,
        CPBB_FREQ: '28 */2 * * *',
        CPBB_TICKER: 'BTC',
        CPBB_CURRENCY: 'USD',
        CPBB_VOL: 10,
        CPBB_APY: 10, // sell if over 10% APY

        // MAKER REBUY CONFIG
        // The below section will create the following maker orders after a sell
        // .0001 BTC @ price -4% (as long as bitcoin is under $100K)
        // .0001 BTC @ price -6% (but only if this doesn't bust the $10 max)
        // .0002 BTC @ price -8% (but only if this doesn't bust the $10 max)
        // .0002 BTC @ price -10% (but only if this doesn't bust the $10 max)
        // .0003 BTC @ price -12% (but only if this doesn't bust the $10 max)
        // etc...

        // maximum dollar value consumed by limit order placements
        CPBB_REBUY_MAX: 10,
        // minimum order is in BTC (.0001, which is $5 at $50K)
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
        CPBB_REBUY_CANCEL: 60 * 24 * 5,
        // if there are twelve unfilled limit orders remaining on the books, expire them
        // and rebuild the limit order set immediately using the sum total of funds
        // used for all the limit orders that existed, starting with the price at the highest limit value
        // using the rebuy config to create new orders
        // NOTE: if you use this setting, it is recommended that you set it higher than
        // the number of items in your CPBB_REBUY config so it doesn't excessively rebuild
        // the same orders over and over
        CPBB_REBUY_REBUILD: 12,
      },
    },
  ],
};
