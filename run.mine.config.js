const apiKeys = require("./api.keys");
const script = ".";
const watch = ["./index.js", "./config.js", "coinbase/*.js", "lib/*.js"];
module.exports = {
  apps: [
    {
      // CPBB_FREQ="35 */4 * * *" CPBB_VOL=50 CPBB_APY=15 node project.forward.js
      name: "cpbb_btcusd",
      script,
      watch,
      env: {
        // VERBOSE: false,
        NODE_ENV: "production",
        CPBB_APIPASS: apiKeys.CPBB_APIPASS,
        CPBB_APIKEY: apiKeys.CPBB_APIKEY,
        CPBB_APISEC: apiKeys.CPBB_APISEC,
        CPBB_FREQ: "35 */6 * * *",
        CPBB_TICKER: "BTC",
        CPBB_CURRENCY: "USD",
        CPBB_VOL: 100,
        CPBB_APY: 150,
        // max $ spend on limit rebuys
        CPBB_REBUY_MAX: 50,
        // minimum order is .0001 BTC ($5 at $50K)
        // rebuy logic will place up orders at this size until CPBB_REBUY_MAX is reached
        CPBB_REBUY_SIZE: ".0001,.0002,.0003,.0004,.0005,.0006,.0007,.0008,.0009,.001",
        // rebuy at these percentage drop targets (-1%, -2%, etc)
        // note: you have to define at least the number of points in CPBB_REBUY_SIZE
        CPBB_REBUY_AT: "-1,-2,-4,-6,-8,-10,-12,-25,-50,-80",
      },
    },
    {
      name: "cpbb_ethusd",
      script,
      watch: watch,
      env: {
        NODE_ENV: "production",
        CPBB_APIPASS: apiKeys.CPBB_APIPASS,
        CPBB_APIKEY: apiKeys.CPBB_APIKEY,
        CPBB_APISEC: apiKeys.CPBB_APISEC,
        CPBB_FREQ: "41 17 * * *",
        CPBB_TICKER: "ETH",
        CPBB_CURRENCY: "USD",
        CPBB_VOL: 25,
        CPBB_APY: 100,
        // max $ spend on limit rebuys
        CPBB_REBUY_MAX: 15,
        // minimum order is .001 ETH ($5 at $5K)
        // rebuy logic will place up to  orders at this size until CPBB_REBUY_MAX is reached
        CPBB_REBUY_SIZE: ".001,.002,.003,.004,.005,.006,.007,.008,.009,.01",
        // note: you have to define at least the number of points in CPBB_REBUY_SIZE
        CPBB_REBUY_AT: "-2,-4,-6,-8,-10,-12,-15,-25,-50,-80",
      },
    },
    {
      name: "cpbb_ltcusd",
      script,
      watch: watch,
      env: {
        NODE_ENV: "production",
        CPBB_APIPASS: apiKeys.CPBB_APIPASS,
        CPBB_APIKEY: apiKeys.CPBB_APIKEY,
        CPBB_APISEC: apiKeys.CPBB_APISEC,
        CPBB_FREQ: "21 17 * * *",
        CPBB_TICKER: "LTC",
        CPBB_CURRENCY: "USD",
        CPBB_VOL: 25,
        CPBB_APY: 100,
        // max $ spend on limit rebuys
        CPBB_REBUY_MAX: 15,
        // minimum order is in LTC (.01, which is $5 at $500)
        // rebuy logic will place up to  orders at this size until CPBB_REBUY_MAX is reached
        CPBB_REBUY_SIZE: ".01,.02,.03,.04,.05,.06,.07,.08,.09,.1",
        // note: you have to define at least the number of points in CPBB_REBUY_SIZE
        CPBB_REBUY_AT: "-2,-4,-6,-8,-10,-12,-15,-25,-50,-80",
      },
    },
    {
      name: "cpbb_dashusd",
      script,
      watch: watch,
      env: {
        NODE_ENV: "production",
        CPBB_APIPASS: apiKeys.CPBB_APIPASS,
        CPBB_APIKEY: apiKeys.CPBB_APIKEY,
        CPBB_APISEC: apiKeys.CPBB_APISEC,
        CPBB_FREQ: "31 17 * * *",
        CPBB_TICKER: "DASH",
        CPBB_CURRENCY: "USD",
        CPBB_VOL: 25,
        CPBB_APY: 100,
        // max $ spend on limit rebuys
        CPBB_REBUY_MAX: 15,
        // minimum order is in DASH (.01, which is $5 at $500)
        // rebuy logic will place up to  orders at this size until CPBB_REBUY_MAX is reached
        CPBB_REBUY_SIZE: ".01,.02,.03,.04,.05,.06,.07,.08,.09,.1",
        // rebuy at these percentage drop targets (-1%, -2%, etc)
        // note: you have to define at least the number of points in CPBB_REBUY_SIZE
        CPBB_REBUY_AT: "-2,-4,-6,-8,-10,-12,-15,-25,-50,-80",
      },
    },
  ],
};
