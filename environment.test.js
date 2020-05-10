const config = require('./config')
console.log(`🤖 Position Builder Engine ${config.pjson.version} running against ${config.api} in ${process.env.CPBB_DRY_RUN?'DRY RUN':'LIVE'} mode, using ${config.vol} $${config.currency} ➡️  $${config.ticker} at cron(${config.freq}) with target ${config.apy * 100}% APY`)

setInterval(()=>{
  console.log('test')
}, 1000)
