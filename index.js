const { CronJob } = require('cron');

const config = require('./config');
const action = require('./lib/action');
const getAccounts = require('./coinbase/accounts');
const getProduct = require('./coinbase/get.product');
// const getAPY = require('./lib/getAPY');
const getTicker = require('./coinbase/get.ticker');
const log = require('./lib/log');
const logOutput = require('./lib/log.output');
const memory = require('./lib/memory');
const { add, divide, multiply, subtract } = require('./lib/math');

const job = new CronJob(config.freq, action);

const startEngine = async () => {
  const product = await getProduct(config.productID);
  product.precision = product.base_increment.includes('0.')
    ? product.base_increment.replace('0.', '').replace(/1[0]+/, '1').length
    : 0;
  memory.product = product;
  // log.now({product})
  log.now(
    `${product.status === 'online' ? '🆗' : '🚨'} ${config.productID} ${
      product.status
    }, min size ${product.base_min_size}, precision: ${
      product.base_increment
    } (${product.precision}), min funds ${product.min_market_funds} ${
      product.status_message
    }`
  );
  log.bot(
    `Position Builder Bot ${config.pjson.version}, ${config.api} in ${
      config.dry ? 'DRY RUN' : 'LIVE'
    } mode, ${config.vol} $${config.currency} ➡️  $${config.ticker} @cron(${
      config.freq
    }), ${
      process.env.CPBB_APY_DYNAMIC
        ? `dynamic APY: ${process.env.CPBB_APY_DYNAMIC}`
        : `${multiply(config.apy, 100)}% APY`
    }${process.env.VERBOSE === 'true' ? `, verbose logging` : ''}`
  );
  if (config.rebuy.drops.length) {
    const sizes = config.rebuy.sizes;
    const drops = config.rebuy.drops;
    log.now(
      `💵 REBUY $${config.rebuy.max} of ${config.ticker}: ${sizes
        .map((s, i) => `${s}@${multiply(drops[i], 100)}%`)
        .join(', ')}`
    );
  }
  if (config.resell.pumps.length) {
    const sizes = config.resell.sizes;
    const pumps = config.resell.pumps;
    log.now(
      `💵 RESELL $${config.resell.max} of ${config.ticker}: ${sizes
        .map((s, i) => `${s}@${multiply(pumps[i], 100)}%`)
        .join(', ')}`
    );
  }
  if (config.limitOnly) {
    // this mode says "I want to buy this asset, but only when it's flashing downward during the timing interval"
    log.now(
      `${config.productID} set to LIMIT ONLY MODE (will not create market taker trades, only limit orders at drops/pumps)`
    );
  }

  log.debug(memory.lastLog);

  const accounts = await getAccounts().catch(e => console.error(e));

  if (!accounts) {
    log.error(
      `Failed to load your account info. Are your keys correctly loaded in the environment?\nDouble check them and then do "pm2 kill; pm2 start [YOUR_CONFIG_NAME].js". Still having issues? Add VERBOSE=true to your config and kill/start app again to see verbose logs.`
    );
    return;
  }
  // find the trading account we care about
  memory.account = accounts.find(a => a.currency === config.currency);

  log.now(
    `🏦 $${config.currency} account loaded with ${
      memory.account.available_balance.value
    }/${add(
      memory.account.available_balance.value,
      memory.account.hold.value
    )} (${Math.floor(
      divide(memory.account.available_balance.value, config.vol)
    )} buy actions)`
  );

  // immediate kick off (testing mode)
  if (config.dry) {
    log.now('dry run, kicking off test run now:');
    await action();
  }

  // start the cronjob
  job.start();

  log.ok(`last transaction for ${config.productID}:`);
  logOutput(memory.lastLog);
  const ticker = await getTicker();

  const nextDate = job.nextDates();
  const currentHolding = add(memory.lastLog.Holding, memory.lastLog.Shares);
  const holdingValue = multiply(ticker.price, currentHolding);
  const liquidValue = add(holdingValue, memory.lastLog.Realized);
  const totalCost = add(
    memory.lastLog.TotalInput,
    memory.lastLog.Funds > 0 ? memory.lastLog.Funds : 0
  );
  log.now(
    `🕟 next run ${nextDate.fromNow()}, on ${nextDate
      .local()
      .format()}, holding ${currentHolding} @${
      ticker.price
    } (market) = $${holdingValue}, paid ${totalCost.toFixed(2)},` +
      // ` target APY calculation ${multiply(
      //   getAPY({
      //     totalInput: totalCost,
      //     endValue: holdingValue,
      //     dateNow: new Date(),
      //   }),
      //   100
      // ).toFixed(2)}%`+
      ` liquid gain ${
        totalCost
          ? multiply(
              divide(subtract(liquidValue, totalCost), totalCost),
              100
            ).toFixed(2)
          : 0
      }%`
  );

  return job;
};

module.exports = startEngine();
