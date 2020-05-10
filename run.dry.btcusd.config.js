module.exports = {
  apps: [{
    name: "cpbb_btcusd",
    script: '.',
    watch: ['*.js','coinbase','lib'],
    env: {
      NODE_ENV: "production",
      CPBB_DRY_RUN: true,
      CPBB_FREQ: "* * * * *",
      CPBB_TICKER: "BTC",
      CPBB_CURRENCY: "USD",
      CPBB_VOL: 10,
      CPBB_APY: 15,
    }
  }]
};
