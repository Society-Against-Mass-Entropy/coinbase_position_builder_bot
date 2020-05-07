const fs = require('fs')
const config = {
  api: process.env.CPBB_TEST ? 'https://api-public.sandbox.pro.coinbase.com' : 'https://api.pro.coinbase.com',
  // default run once per 12 hours at the 5th minute (crontab syntax)
  // testing mode will run every minute
  freq: process.env.CPBB_TEST ? '* * * * *' : (process.env.CPBB_FREQ || '05 */12 * * *'),
  // default $10 action
  vol: Number(process.env.CPBB_VOL || 10),
  // default 15% APY target (we aim to shave off any excess from this gain)
  apy: Number(process.env.CPBB_APY || 15) / 100,
  // default ticker currency is BTC
  ticker: process.env.CPBB_TICKER || 'BTC',
  // default home currency is USD
  currency: process.env.CPBB_CURRENCY || 'USD',
  pjson: require('./package')
}
config.productID = config.ticker + '-' + config.currency
config.history_file = `${__dirname}/data/history.${config.productID}.tsv`
if(!fs.existsSync(config.history_file)){
  // copy the template
  fs.copyFileSync(`${__dirname}/data/history.tsv`, config.history_file)
}
module.exports = config
