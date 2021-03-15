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
        // 12:05am + 12:05pm (2x daily)
        CPBB_FREQ: '5 */12 * * *',
        CPBB_TICKER: 'BTC',
        CPBB_CURRENCY: 'USD',
        CPBB_VOL: 10, // $10
        CPBB_APY: 15, // sell if over 15% APY
        // max $ spend on limit rebuys
        CPBB_REBUY_MAX: 10,
        // minimum order is .0001 BTC ($5 at $50K)
        // rebuy logic will place up orders at this size until CPBB_REBUY_MAX is reached
        CPBB_REBUY:
          '.0001@1,.0002@2,.0003@3,.0004@4,.0005@5,.0006@6,.0007@7,.0008@8,.0009@9,.001@10,.0015@12,.002@15,.004@20,.008@25,.016@30,.032@35,.064@40,.128@45,.256@50,.512@55,1@60,2@65,4@70,8@75,16@80,32@85,64@90,128@95,200@96,200@97,200@98',
        // when should we cancel limit orders?
        // default behavior is on the next action point (if they didn't fill)
        // if CPBB_REBUY_CANCEL is set, this is a number of minutes after the limit order
        // creation timestamp that it will be considered ready to cancel if not filled
        // 60 * 24 * 14 = 14 days
        CPBB_REBUY_CANCEL: 60 * 24 * 14,
        // if there are twelve unfilled limit orders remaining on the books, expire them
        // and rebuild the limit order set immediately using the sum total of funds
        // used for all the limit orders and starting with the price at the highest limit value
        // using the rebuy config to create new orders
        // NOTE: if you use this setting, it is recommended that you set it higher than
        // the number of items in your CPBB_REBUY config so it doesn't excessively rebuild
        // the same orders over and over
        CPBB_REBUY_REBUILD: 32,
      },
    },
  ],
};
