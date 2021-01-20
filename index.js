const { CronJob } = require("cron");

const config = require("./config");

const { add } = require("mathjs");
const action = require("./lib/action");
const getAccounts = require("./coinbase/accounts");
const loadLastLog = require('./lib/load.lastLog');
const log = require("./lib/log");
const logOutput = require('./lib/log.output');
const memory = require("./data/memory");

const job = new CronJob(config.freq, action);

(async () => {
  log.now(
    `🤖 Position Builder Bot ${config.pjson.version}, ${
    config.api
    } in ${process.env.CPBB_DRY_RUN ? "DRY RUN" : "LIVE"} mode, ${
    config.vol
    } $${config.currency} ➡️  $${config.ticker} @ cron(${
    config.freq
    }), ${config.apy * 100}% APY target, ${process.env.VERBOSE ? `verbose` : 'ledger'} logging`
  );

  // console.log(memory.lastLog);

  log.ok(`history loaded: holding ${add(memory.lastLog.Holding, memory.lastLog.Shares)} ${config.ticker} worth ${memory.lastLog.EndValue}, liquid profit ${memory.lastLog.Profit}`)

  const accounts = await getAccounts().catch((e) => console.error(e));

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
  log.ok(`next run ${nextDate.fromNow()}, on ${nextDate.format()}`);
})();
