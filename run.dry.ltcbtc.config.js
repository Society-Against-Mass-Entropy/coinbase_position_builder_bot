/**
 * buys LTC with BTC at interval (accumulates LTC using BTC)
 */
module.exports = {
  apps: [{
    name: "cpbb_ltcbtc",
    script: '.',
    watch: ['*.js','coinbase','lib'],
    env: {
      NODE_ENV: "production",
      CPBB_APIPASS: process.env.CPBB_APIPASS||'load your keys via real environmental vars or replace this quoted string',
      CPBB_APIKEY: process.env.CPBB_APIKEY||'load your keys via real environmental vars or replace this quoted string',
      CPBB_APISEC: process.env.CPBB_APISEC||'load your keys via real environmental vars or replace this quoted string',
      CPBB_DRY_RUN: true,
      CPBB_FREQ: "* * * * *",
      CPBB_TICKER: "LTC",
      CPBB_CURRENCY: "BTC",
      CPBB_VOL: .01, // trading .01 BTC for LTC
      CPBB_APY: 15,
    }
  }]
};
