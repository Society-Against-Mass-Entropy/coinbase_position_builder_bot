/**
 * buys LTC with BTC at interval (accumulates LTC using BTC)
 *
 * This exists as a way to test using an alt with a volatile BTC relationship
 * To accumulate more BTC
 *
 * Note: Buying alts is risky. You could lose all your Bitcoin!
 * Further Note: This engine is built to accumulate the target ticker
 * at the expense of the currency. This means, the engine will aim to grow the
 * LTC portfolio at the expense of BTC
 *
 * If you don't want to do this, you should plan on liquidating the full
 * accumulation at some profitable point
 */
const apiKeys = require("./api.keys");
module.exports = {
  apps: [
    {
      name: "cpbb_ltcbtc",
      script: ".",
      watch: ["*.js", "coinbase", "lib"],
      env: {
        NODE_ENV: "production",
        // sell ALL when profitable!
        CPBB_LIQUIDATE: true,
        CPBB_APIPASS: apiKeys.CPBB_APIPASS,
        CPBB_APIKEY: apiKeys.CPBB_APIKEY,
        CPBB_APISEC: apiKeys.CPBB_APISEC,
        CPBB_DRY_RUN: true,
        CPBB_FREQ: "25 * * * *",
        CPBB_TICKER: "LTC",
        CPBB_CURRENCY: "BTC",
        // trading .005 BTC for ~ 1 LTC
        // (at the time of this creation 1 LTC = .0048 BTC)
        CPBB_VOL: 0.005,
        // sell at +5% APY
        CPBB_APY: 5,
      },
    },
  ],
};
