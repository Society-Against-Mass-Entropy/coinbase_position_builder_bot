const { CronJob } = require('cron');

const config = require('./config');
const apiKeys = require('./api.keys.js');
const action = require('./lib/action');
const getAccounts = require('./coinbase/accounts');
const loadLastLog = require('./lib/load.lastLog');
const log = require('./lib/log');
const logOutput = require('./lib/log.output');
const memory = require('./lib/memory');

const job = new CronJob(config.freq, action);

(async () => {
  if (
    !apiKeys.CPBB_APIKEY ||
    !apiKeys.CPBB_APISEC ||
    !apiKeys.CPBB_APIPASS ||
    apiKeys.CPBB_APIKEY.includes('load your keys') ||
    apiKeys.CPBB_APISEC.includes('load your keys') ||
    apiKeys.CPBB_APIPASS.includes('load your keys')
  ) {
    log.error(
      'API Keys are not correctly configured.\nPlease check the setup instructions and load your API keys into the environment before starting.\nHalting the app now.'
    );
    return;
  }
  log.bot(
    `Position Builder Bot ${config.pjson.version}, ${config.api} in ${
      config.dry ? 'DRY RUN' : 'LIVE'
    } mode, ${config.vol} $${config.currency} ➡️  $${config.ticker} @ cron(${
      config.freq
    }), ${config.apy * 100}% APY, ${
      process.env.VERBOSE === 'true' ? `verbose logging` : ''
    }`
  );
  if (config.rebuy.drops.length) {
    const sizes = process.env.CPBB_REBUY_SIZE.split(',');
    const drops = process.env.CPBB_REBUY_AT.split(',');
    log.now(
      `💵 REBUY up to $${config.rebuy.max} of ${config.ticker}: ${sizes
        .map((s, i) => `${s}@${drops[i]}%`)
        .join(', ')}`
    );
  }
  if (config.rebuy.only) {
    // this mode says "I want to buy this asset, but only when it's flashing downward during the timing interval"
    log.now(
      `${config.productID} set to REBUY ONLY MODE (will not create market taker trades, only limit orders at drops)`
    );
  }

  log.debug(memory.lastLog);

  log.now(
    `📒 history loaded: holding ${(
      memory.lastLog.Holding + memory.lastLog.Shares
    ).toFixed(8)} ${config.ticker} worth ${
      memory.lastLog.EndValue
    }, liquid profit ${memory.lastLog.Profit}`
  );

  const accounts = await getAccounts().catch(e => console.error(e));

  if (!accounts) {
    log.error(
      `Failed to load your account info. Are your keys correctly loaded in the environment?\nDouble check them and then do "pm2 kill; pm2 start [YOUR_CONFIG_NAME].js". Still having issues? Add VERBOSE=true to your config and kill/start app again to see verbose logs.`
    );
    return;
  }
  // find the trading account we care about
  // eslint-disable-next-line prefer-destructuring
  memory.account = accounts.filter(a => a.currency === config.currency)[0];
  log.now(
    `🏦 $${config.currency} account loaded with ${memory.account.available}`
  );

  // immediate kick off (testing mode)
  if (process.env.CPBB_TEST || config.dry) action();

  // start the cronjob
  job.start();
  memory.logData = loadLastLog();
  log.ok(`last transaction for ${config.productID}:`);
  logOutput(memory.logData);
  const nextDate = job.nextDates();
  log.now(`🕟 next run ${nextDate.fromNow()}, on ${nextDate.local().format()}`);
})();

module.exports = job;
