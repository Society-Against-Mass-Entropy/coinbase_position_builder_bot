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
        CPBB_FREQ: '02 5 * * *',
        CPBB_TICKER: 'BTC',
        CPBB_CURRENCY: 'USD',
        CPBB_VOL: 400,
        CPBB_APY: 100,
        // max $ spend on limit rebuys
        // CPBB_REBUY_MAX: 50,
        // minimum order is .0001 BTC ($5 at $50K)
        // rebuy logic will place up orders at this size until CPBB_REBUY_MAX is reached
        // CPBB_REBUY:
        // '.0001@3,.0005@6,.001@9,.005@12,.01@15,.05@20,.1@25,.5@30,1@50',
        // when should we cancel limit orders?
        // default behavior is on the next action point (if they didn't fill)
        // if CPBB_REBUY_CANCEL is set, this is a number of minutes after the limit order
        // creation timestamp that it will be considered ready to cancel if not filled
        // CPBB_REBUY_CANCEL: 60 * 24 * 14,
        // if there are this many unfilled limit orders remaining on the books, expire them
        // and rebuild the limit order set immediately using the sum total of funds
        // used for all the limit orders and starting with the price at the highest limit value
        // using the rebuy config to create new orders
        // NOTE: if you use this setting, it is recommended that you set it higher than
        // the number of items in your CPBB_REBUY config so it doesn't excessively rebuild
        // the same orders over and over
        // CPBB_REBUY_REBUILD: 35,
        // sell up to $50 worth of asset
        // CPBB_RESELL_MAX: 50,
        // sell up to 1 units of asset @ +10% pump
        // CPBB_RESELL: '1@10',
        // no rebuild, auto cancel before next run
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
        CPBB_FREQ: '42 5 * * *',
        CPBB_TICKER: 'ETH',
        CPBB_CURRENCY: 'USD',
        CPBB_VOL: 100,
        CPBB_APY: 20,
        // max $ spend on limit rebuys
        // CPBB_REBUY_MAX: 10,
        // // minimum order is .001 ETH ($5 at $5K)
        // // rebuy logic will place orders at this size until CPBB_REBUY_MAX is reached
        // CPBB_REBUY:
        //   '.001@4,.002@5,.003@6,.004@8,.005@10,.01@15,.02@20,.04@25,.08@30,.16@35,.32@40,.64@50,1.28@60,2.56@70,5.12@80,10.24@90',
        // CPBB_REBUY_CANCEL: 60 * 24 * 14,
        // CPBB_REBUY_REBUILD: 35,
        CPBB_RESELL_MAX: 25,
        CPBB_RESELL: '10@5',
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
        CPBB_FREQ: '18 6 * * *',
        CPBB_TICKER: 'LTC',
        CPBB_CURRENCY: 'USD',
        CPBB_VOL: 50,
        CPBB_APY: 15,
        // max $ spend on limit rebuys
        // CPBB_REBUY_MAX: 10,
        // // minimum order is in LTC (.01, which is $5 at $500)
        // // rebuy logic will place orders at this size until CPBB_REBUY_MAX is reached
        // CPBB_REBUY:
        //   '.01@4,.02@5,.03@6,.04@8,.05@10,.1@15,.2@20,.4@25,.8@30,1.6@35,3.2@40,6.4@50,12.8@60,25.6@70,51.2@80,102.4@90',
        // CPBB_REBUY_CANCEL: 60 * 24 * 14,
        // CPBB_REBUY_REBUILD: 20,
        // sell up to $5 worth of asset
        CPBB_RESELL_MAX: 25,
        // sell up to 10 units of asset @ +5% pump
        CPBB_RESELL: '10@5',
        // no rebuild, auto cancel before next run
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
        CPBB_FREQ: '35 6 * * *',
        CPBB_TICKER: 'DASH',
        CPBB_CURRENCY: 'USD',
        CPBB_VOL: 20,
        CPBB_APY: 10,
        // sell up to $5 worth of DASH
        CPBB_RESELL_MAX: 20,
        // sell up to 100 DASH @ +5% pump
        CPBB_RESELL: '100@5',
        // no rebuild, auto cancel before next run
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
        CPBB_FREQ: '46 6 * * *',
        CPBB_TICKER: 'XTZ',
        CPBB_CURRENCY: 'USD',
        CPBB_VOL: 50,
        CPBB_APY: 50,
        // max $ spend on limit rebuys
        // CPBB_REBUY_MAX: 10,
        // // minimum order is 1 XTZ, with a max precision of .01 XTZ
        // CPBB_REBUY:
        //   '1@4,2@5,3@6,4@8,5@10,6@12,7@14,8@16,9@18,10@20,11@22,12@24,13@26,14@28,15@30,16@32,17@34,18@36,19@38,20@40,25@50,50@60,100@80',
        // CPBB_REBUY_CANCEL: 60 * 24 * 14,
        // CPBB_REBUY_REBUILD: 25,
        // sell up to $5 worth of asset
        CPBB_RESELL_MAX: 50,
        // sell up to 100 units of asset @ +5% pump
        CPBB_RESELL: '100@5',
        // no rebuild, auto cancel before next run
      },
    },
    {
      name: 'doge',
      script,
      watch: watch,
      env: {
        NODE_ENV: 'production',
        CPBB_APIPASS: apiKeys.CPBB_APIPASS,
        CPBB_APIKEY: apiKeys.CPBB_APIKEY,
        CPBB_APISEC: apiKeys.CPBB_APISEC,
        CPBB_FREQ: '53 6 * * *',
        CPBB_TICKER: 'DOGE',
        CPBB_CURRENCY: 'USD',
        CPBB_VOL: 10,
        CPBB_APY: 10,
        // sell up to $5 worth of asset
        CPBB_RESELL_MAX: 10,
        // sell up to 100 units of asset @ +5% pump
        CPBB_RESELL: '100@5',
        // no rebuild, auto cancel before next run
      },
    },
  ],
};
