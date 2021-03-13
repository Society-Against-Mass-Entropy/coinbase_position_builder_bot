const apiKeys = require('./api.keys');
const script = '.';
const watch = ['./index.js', './config.js', 'coinbase/*.js', 'lib/*.js'];
module.exports = {
  apps: [
    {
      // CPBB_FREQ="35 */4 * * *" CPBB_VOL=50 CPBB_APY=15 node project.forward.js
      name: 'btc',
      script,
      watch,
      env: {
        VERBOSE: false,
        NODE_ENV: 'production',
        CPBB_APIPASS: apiKeys.CPBB_APIPASS,
        CPBB_APIKEY: apiKeys.CPBB_APIKEY,
        CPBB_APISEC: apiKeys.CPBB_APISEC,
        CPBB_FREQ: '05 */6 * * *',
        CPBB_TICKER: 'BTC',
        CPBB_CURRENCY: 'USD',
        CPBB_VOL: 100,
        CPBB_APY: 150,
        // max $ spend on limit rebuys
        CPBB_REBUY_MAX: 75,
        // minimum order is .0001 BTC ($5 at $50K)
        // rebuy logic will place up orders at this size until CPBB_REBUY_MAX is reached
        // CPBB_REBUY_SIZE:
        //   '.0001,.0002,.0004,.0008,.001,.002,.004,.008,.016,.032,.064,.128,.256,.512,1.024,2.048',
        // // rebuy at these percentage drop targets (-1%, -2%, etc)
        // // note: you have to define at least the number of points in CPBB_REBUY_SIZE
        // CPBB_REBUY_AT:
        //   '-4,-6,-8,-10,-12,-15,-20,-25,-30,-35,-40,-50,-60,-70,-80,-90',
        CPBB_REBUY:
          '.0001@2,.0002@3,.0003@4,.0004@5,.0005@6,.0006@7,.0007@8,.0008@10,.001@12,.002@15,.004@20,.008@25,.016@30,.032@35,.064@40,.128@50,.256@60,.512@70,1.024@80,2.048@90',
        // when should we cancel limit orders?
        // default behavior is on the next action point (if they didn't fill)
        // if CPBB_REBUY_CANCEL is set, this is a number of minutes after the limit order
        // creation timestamp that it will be considered ready to cancel if not filled
        CPBB_REBUY_CANCEL: 60 * 24 * 14,
        // if there are twelve unfilled limit orders remaining on the books, expire them
        // and rebuild the limit order set immediately using the sum total of funds
        // used for all the limit orders and starting with the price at the highest limit value
        // using the rebuy config to create new orders
        // NOTE: if you use this setting, it is recommended that you set it higher than
        // the number of items in your CPBB_REBUY config so it doesn't excessively rebuild
        // the same orders over and over
        CPBB_REBUY_REBUILD: 17,
      },
    },
    {
      name: 'eth',
      script,
      watch: watch,
      env: {
        // VERBOSE: true,
        NODE_ENV: 'production',
        CPBB_APIPASS: apiKeys.CPBB_APIPASS,
        CPBB_APIKEY: apiKeys.CPBB_APIKEY,
        CPBB_APISEC: apiKeys.CPBB_APISEC,
        CPBB_FREQ: '15 1,5,9,13,17,21 * * *',
        CPBB_TICKER: 'ETH',
        CPBB_CURRENCY: 'USD',
        CPBB_VOL: 10,
        CPBB_APY: 100,
        // max $ spend on limit rebuys
        CPBB_REBUY_MAX: 10,
        // minimum order is .001 ETH ($5 at $5K)
        // rebuy logic will place orders at this size until CPBB_REBUY_MAX is reached
        CPBB_REBUY:
          '.001@2,.002@4,.003@6,.004@8,.005@10,.01@15,.02@20,.04@25,.08@30,.16@35,.32@40,.64@50,1.28@60,2.56@70,5.12@80,10.24@90',
        CPBB_REBUY_CANCEL: 60 * 24 * 14,
        CPBB_REBUY_REBUILD: 17,
      },
    },
    {
      name: 'ltc',
      script,
      watch: watch,
      env: {
        NODE_ENV: 'production',
        CPBB_APIPASS: apiKeys.CPBB_APIPASS,
        CPBB_APIKEY: apiKeys.CPBB_APIKEY,
        CPBB_APISEC: apiKeys.CPBB_APISEC,
        CPBB_FREQ: '25 */4 * * *',
        CPBB_TICKER: 'LTC',
        CPBB_CURRENCY: 'USD',
        CPBB_VOL: 10,
        CPBB_APY: 100,
        // max $ spend on limit rebuys
        CPBB_REBUY_MAX: 10,
        // minimum order is in LTC (.01, which is $5 at $500)
        // rebuy logic will place orders at this size until CPBB_REBUY_MAX is reached
        CPBB_REBUY:
          '.01@2,.02@4,.03@6,.04@8,.05@10,.1@15,.2@20,.4@25,.8@30,1.6@35,3.2@40,6.4@50,12.8@60,25.6@70,51.2@80,102.4@90',
        CPBB_REBUY_CANCEL: 60 * 24 * 14,
        CPBB_REBUY_REBUILD: 17,
      },
    },
    {
      name: 'dash',
      script,
      watch: watch,
      env: {
        NODE_ENV: 'production',
        CPBB_APIPASS: apiKeys.CPBB_APIPASS,
        CPBB_APIKEY: apiKeys.CPBB_APIKEY,
        CPBB_APISEC: apiKeys.CPBB_APISEC,
        CPBB_FREQ: '35 */4 * * *',
        CPBB_TICKER: 'DASH',
        CPBB_CURRENCY: 'USD',
        CPBB_VOL: 5,
        CPBB_APY: 100,
        // max $ spend on limit rebuys
        CPBB_REBUY_MAX: 5,
        // minimum order is in DASH (.01, which is $5 at $500)
        // rebuy logic will place orders at this size until CPBB_REBUY_MAX is reached
        CPBB_REBUY_SIZE:
          '.01,.02,.03,.04,.05,.1,.2,.4,.8,1.6,3.2,6.4,12.8,25.6,51.2,102.4',
        // note: you have to define at least the number of points in CPBB_REBUY_SIZE
        CPBB_REBUY_AT:
          '-2,-4,-6,-8,-10,-15,-20,-25,-30,-35,-40,-50,-60,-70,-80,-90',
        CPBB_REBUY_CANCEL: 60 * 24 * 14,
        CPBB_REBUY_REBUILD: 17,
      },
    },
    {
      name: 'xtz',
      script,
      watch: watch,
      env: {
        NODE_ENV: 'production',
        CPBB_APIPASS: apiKeys.CPBB_APIPASS,
        CPBB_APIKEY: apiKeys.CPBB_APIKEY,
        CPBB_APISEC: apiKeys.CPBB_APISEC,
        CPBB_FREQ: '45 9,13,17,21 * * *',
        CPBB_TICKER: 'XTZ',
        CPBB_CURRENCY: 'USD',
        CPBB_VOL: 10,
        CPBB_APY: 100,
        // max $ spend on limit rebuys
        CPBB_REBUY_MAX: 5,
        // minimum order is 1 XTZ, with a max precision of .01 XTZ
        CPBB_REBUY:
          '1@2,2@4,3@6,4@8,5@10,6@12,7@14,8@16,9@18,10@20,11@22,12@24,13@26,14@28,15@30,16@32,17@34,18@36,19@38,20@40,25@50,50@60,100@80',
        CPBB_REBUY_CANCEL: 60 * 24 * 14,
        CPBB_REBUY_REBUILD: 17,
      },
    },
  ],
};
