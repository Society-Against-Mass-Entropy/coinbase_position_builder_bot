const { CronJob } = require("cron");

const config = require("./config");

const { add, format } = require("mathjs");
const action = require("./lib/action");
const getAccounts = require("./coinbase/accounts");
const loadLastLog = require('./lib/load.lastLog');
const log = require("./lib/log");
const logOutput = require('./lib/log.output');
const memory = require("./lib/memory");

const job = new CronJob(config.freq, action);

(async () => {
  log.now(
    `🤖 Position Builder Bot ${config.pjson.version}, ${config.api
    } in ${process.env.CPBB_DRY_RUN ? "DRY RUN" : "LIVE"} mode, ${config.vol
    } $${config.currency} ➡️  $${config.ticker} @ cron(${config.freq
    }), ${config.apy * 100}% APY, ${process.env.VERBOSE ? `verbose` : 'ledger'} logging`
  );
  if (process.env.CPBB_REBUY_AT) {
    const sizes = process.env.CPBB_REBUY_SIZE.split(',');
    const drops = process.env.CPBB_REBUY_AT.split(',');
    log.now(`${config.productID}: REBUY up to $${process.env.CPBB_REBUY_MAX} of ${sizes.map((s, i) => `${s}@${drops[i]}%`).join(', ')}`);
  }
  if (process.env.CPBB_REBUY_ONLY === 'true') {
    // this mode says "I want to buy this asset, but only when it's flashing downward during the timing interval"
    log.now(`${config.productID} set to REBUY ONLY MODE (will not create market taker trades, only limit orders at drops)`);
  }

  // console.log(memory.lastLog);

  log.ok(`history loaded: holding ${format(add(memory.lastLog.Holding, memory.lastLog.Shares), { notation: "fixed", precision: 8 })} ${config.ticker} worth ${memory.lastLog.EndValue}, liquid profit ${memory.lastLog.Profit}`)

  const accounts = await getAccounts().catch((e) => console.error(e));

  if (!accounts) {
    log.error(`Failed to load your account info. Are your keys correctly loaded in the environment?\nDouble check them and then do "pm2 kill; pm2 start [YOUR_CONFIG_NAME].js"`);
    return;
  }
  // find the trading account we care about
  // eslint-disable-next-line prefer-destructuring
  memory.account = accounts.filter((a) => a.currency === config.currency)[0];
  log.ok(`$${config.currency} account loaded with ${memory.account.available}`);

  // immediate kick off (testing mode)
  if (process.env.CPBB_TEST || process.env.CPBB_DRY_RUN) action();

  // start the cronjob
  job.start();
  memory.logData = loadLastLog();
  log.ok(`last transaction for ${config.productID}:`);
  logOutput(memory.logData);
  const nextDate = job.nextDates();
  log.ok(`next run ${nextDate.fromNow()}, on ${nextDate.local().format()}`);
})();
