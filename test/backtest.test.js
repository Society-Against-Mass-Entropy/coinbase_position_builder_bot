// TEST CONFIG
process.env.CPBB_TICKER = 'TEST';
process.env.CPBB_CURRENCY = 'USD';
process.env.CPBB_VOL = 100;
process.env.CPBB_FREQ = '1 1 1 1 1';
process.env.CPBB_APY = 25;
process.env.CPBB_TEST = true;
// process.env.CPBB_REBUY_MAX = 50;
// process.env.CPBB_REBUY = '.0001@2,.0002@4,.0003@6,.0004@8,.0005@10';
// // process.env.CPBB_REBUY_SIZE = '.0001,.0002,.0003,.0004,.0005';
// // process.env.CPBB_REBUY_AT = '-2,-4,-6,-8,-10';
// process.env.CPBB_REBUY_CANCEL = 60 * 24 * 1;
// process.env.CPBB_REBUY_REBUILD = 6;
// process.env.CPBB_RESELL_MAX = 50;
// process.env.CPBB_RESELL = '.0001@2,.0005@3';
// // cancel any limit sells that have not filled before taking the next action
// process.env.CPBB_RESELL_CANCEL = 0;
// process.env.CPBB_RESELL_REBUILD = 6;
const verbose = process.env.VERBOSE_TEST === 'true';

// this must be included before loading anything else so we can capture console.log output
const log = require('./lib/log.backtest');
const deleteOutputFiles = require('./lib/delete.output.files');

const priceHistory = require('../data/rates.daily.BTC-USD.json').daily;

process.env.FIRST_LOG_DATE = new Date(priceHistory[0][0] * 1000).toISOString();
require('./nock/delete.order');
require('./nock/get.accounts');
require('./nock/get.order');
require('./nock/get.order.netfail');
require('./nock/get.order.404');
require('./nock/get.product');
require('./nock/get.ticker');
require('./nock/post.orders');
// const config = require('../config');
const action = require('../lib/action');
const engine = require('../index');
const getLog = require('./lib/get.log');
const sleep = require('../lib/sleep');
const testMemory = require('./lib/test.memory');
// const checkLimits = require('../lib/limit.check');
// const memory = require('../lib/memory');

// dates to begin test sequence
let currentDate = new Date(priceHistory[0][0] * 1000);
// a list of filenames in ./data/output.${name}.log that group
// chunks of expected stdout from the app
const logExpectations = ['backtest'];

describe('Backtest Engine', () => {
  // as we load up the log expectations,
  // we iterate over their position in the real log output
  let logIndex = -1;

  beforeAll(async () => {
    deleteOutputFiles();
    // make sure everything loaded and started
    const app = await engine;
    // we will manually run action as if we are hitting cron timers
    app.stop();
    await sleep(2000);

    // mock market conditions and actions as if the cronjob triggered
    for (let i = 0; i < priceHistory.length; i++) {
      let [time, low, high, open, close] = priceHistory[i];
      // if (i % 24) {
      // checks limits and runs an action event
      testMemory.open = open;
      testMemory.price = close;
      testMemory.low = low;
      testMemory.high = high;
      currentDate.setTime(time * 1000);
      // console.log(time, low, high, close, currentDate);
      await action({ dateOverride: currentDate });
      // }
    }
    return;
  });

  logExpectations.forEach(name => {
    test(`Log Output: ${name}`, () => {
      const expectedLog = getLog(name);
      expectedLog.forEach(l => {
        if (!l) return;
        logIndex++;
        expect(log.out[logIndex]).toEqual(l);
      });
    });
  });

  test(`no error outputs`, () => {
    expect(log.warn.length).toBe(0);
    expect(log.err.length).toBe(0);
  });

  afterAll(() => {
    if (verbose) process.stdout.write('\n\n');
    deleteOutputFiles();
  });
});
