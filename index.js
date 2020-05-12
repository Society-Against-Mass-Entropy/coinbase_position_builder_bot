const { CronJob } = require("cron");

const config = require("./config");

const action = require("./lib/action");
const getAccounts = require("./coinbase/accounts");
const history = require("./lib/history");
const log = require("./lib/log");
const memory = require("./data/memory");

const job = new CronJob(config.freq, action);

(async () => {
  // log history
  history.logRecent(5);
  log.now(
    `🤖 Position Builder Engine ${config.pjson.version} running against ${
      config.api
    } in ${process.env.CPBB_DRY_RUN ? "DRY RUN" : "LIVE"} mode, using ${
      config.vol
    } $${config.currency} ➡️  $${config.ticker} at cron(${
      config.freq
    }) with target ${config.apy * 100}% APY`
  );

  const accounts = await getAccounts().catch((e) => console.error(e));

  // find the trading account we care about
  // eslint-disable-next-line prefer-destructuring
  memory.account = accounts.filter((a) => a.currency === config.currency)[0];
  log.ok(`$${config.currency} account loaded with ${memory.account.available}`);

  // immediate kick off (testing mode)
  if (process.env.CPBB_TEST || process.env.CPBB_DRY_RUN) action();

  // start the cronjob
  job.start();
  const nextDate = job.nextDates();
  log.ok(`next run ${nextDate.fromNow()}, on ${nextDate.format()}`);
})();
