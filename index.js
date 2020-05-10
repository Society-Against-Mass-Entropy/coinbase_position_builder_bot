const config = require('./config')
const action = require('./lib/action')
const CronJob = require('cron').CronJob
const getAccounts = require('./coinbase/accounts')
const history = require('./lib/history')
const job = new CronJob(config.freq, action)
const log = require('./lib/log')
const memory = require('./data/memory')

// log history
history.logRecent(5)
console.log(`🤖 Position Builder Engine ${config.pjson.version} running against ${config.api} in ${process.env.CPBB_DRY_RUN?'dry run':'live'} mode, using ${config.currency}${configonfig.ticker} in $${config.currency} ${config.vol} volume at cron(${config.freq}) on ${config.ticker} with target ${config.apy * 100}% APY`)

getAccounts((err, data) => {
  if (err || !data.length) return console.error(err, data)
  // find the trading account we care about
  memory.account = data.filter(a => a.currency === config.currency)[0]
  log(`${config.currency} account loaded with ${memory.account.available}`)

  // immediate kick off (testing mode)
  if (process.env.CPBB_TEST || process.env.CPBB_DRY_RUN) action()

  // start the cronjob
  job.start()
  const nextDate = job.nextDates()
  console.log(`⚡ next run ${nextDate.fromNow()}, on ${nextDate.format()}`)
})
