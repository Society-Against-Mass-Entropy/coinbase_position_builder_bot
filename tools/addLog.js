/**
 * manual corrective logging script to add an entry that failed to complete in time via the API
 * - sometimes this happens when the API is bogged down (rare but seen during peaks)
 *
 * to use, look at your transaction log history on Coinbase
 * find the last transaction that succeeded but failed to be tracked in the engine
 * run like so:
 *
 * node addLog.js BTC USD 50 20 2020-11-26T16:35:00.706Z 16915.52 0.00295586
 */
// do not really make any new orders (just calculate and log)
process.env.CPBB_TICKER = process.argv[2];
process.env.CPBB_CURRENCY = process.argv[3];
process.env.CPBB_VOL = process.argv[4];
process.env.CPBB_APY = process.argv[5];

const { add } = require('../lib/math');
const action = require('../lib/action');
const config = require('../config');
const log = require('../lib/log');
const memory = require('../lib/memory');
const touch = require('../lib/touch');

const dateOverride = new Date(process.argv[6]);
const price = process.argv[7];
process.env.LOG_CORRECTION = process.argv[8];

if (process.argv.length !== 9) {
  log.error(
    'invalid arguments, invoke like so: node addLog.js BTC USD 50 20 2020-11-26T16:35:00.706Z 16915.52 0.00295586'
  );
  process.exit();
}

log.ok(
  `history loaded: holding ${add(
    memory.lastLog.Holding,
    memory.lastLog.Shares
  ).toFixed(8)} ${config.ticker} worth ${
    memory.lastLog.EndValue
  }, liquid profit ${memory.lastLog.Profit}`
);

(async () => {
  await action({
    price,
    dateOverride,
  });

  // finally, touch the index file so our pm2 filewatcher will auto-restart the service
  // this will load the latest history file into memory for the next job run
  touch('../index.js');
})();
