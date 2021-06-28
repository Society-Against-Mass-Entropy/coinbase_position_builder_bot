// TEST CONFIG
process.env.CPBB_TICKER = 'TEST';
process.env.CPBB_CURRENCY = 'USD';
process.env.CPBB_VOL = 100;
process.env.CPBB_FREQ = '1 1 1 1 1';
process.env.CPBB_APY = 25;
process.env.FIRST_LOG_DATE = '2021-01-01T00:00:00.000Z';
process.env.CPBB_TEST = true;
process.env.CPBB_REBUY_MAX = 50;
process.env.CPBB_REBUY = '.0001@2,.0002@4,.0003@6,.0004@8,.0005@10';
// process.env.CPBB_REBUY_SIZE = '.0001,.0002,.0003,.0004,.0005';
// process.env.CPBB_REBUY_AT = '-2,-4,-6,-8,-10';
process.env.CPBB_REBUY_CANCEL = 60 * 24 * 1;
process.env.CPBB_REBUY_REBUILD = 6;
process.env.CPBB_RESELL_MAX = 50;
process.env.CPBB_RESELL = '.0001@2,.0005@3';
// cancel any limit sells that have not filled before taking the next action
process.env.CPBB_RESELL_CANCEL = 0;
process.env.CPBB_RESELL_REBUILD = 6;
const verbose = process.env.VERBOSE_TEST === 'true';

// this must be included before loading anything else so we can capture console.log output
const log = require('./lib/log');
const deleteOutputFiles = require('./lib/delete.output.files');

require('./nock/delete.order');
require('./nock/get.accounts');
require('./nock/get.order');
require('./nock/get.order.netfail');
require('./nock/get.order.404');
require('./nock/get.product');
require('./nock/get.ticker');
require('./nock/post.orders');
const config = require('../config');
const action = require('../lib/action');
const engine = require('../index');
const getLog = require('./lib/get.log');
const sleep = require('../lib/sleep');
const testMemory = require('./lib/test.memory');
const checkLimits = require('../lib/limit.check');
const memory = require('../lib/memory');

// dates to begin test sequence
let currentDate = new Date('2021-01-01');
const priceChanges = [
  // buy, set resell orders
  '50000',
  // buy and one resell triggers (other canceled)
  // sets new resell orders
  '51010',
  // buy, canceles resell, sets new targets
  '50050',
  // buy, canceles resell, sets new targets
  '51050',
  // buy, canceles resell, sets new targets
  '51100',
  // buy, canceles resell, sets new targets
  '51000',
  // buy, canceles resell, sets new targets
  '51050',
  // buy, canceles resell, sets new targets
  '51020',
  // buy, canceles resell, sets new targets
  '51120',
  // resells trigger, buy, set new sell
  '61000',
  // resells fill, sell (over APY), creates rebuy limit orders
  '101000',
  // rebuys have more time, sell, create more rebuy limits (rebuild rebuys)
  '98000',
  // now enought time has passed to make our APY target buy this price
  '97000',
  '96000',
  '95000',
  '94000',
  '92000',
  // trigger rebuy limits
  '50000',
];

// a list of filenames in ./data/output.${name}.log that group
// chunks of expected stdout from the app
const logExpectations = [
  '00.boot',
  '01.accumulate',
  '02.profit',
  '03.accumulate',
];
const run = async price => {
  testMemory.price = price;
  currentDate.setDate(currentDate.getDate() + 1);
  return action({ dateOverride: currentDate });
};

describe('Engine', () => {
  // as we load up the log expectations, we iterate over their position in the real log output
  let logIndex = -1;

  beforeAll(async () => {
    deleteOutputFiles();
    // make sure everything loaded and started
    const app = await engine;
    // we will manually run action as if we are hitting cron timers
    app.stop();
    await sleep(2000);

    // mock market conditions and actions as if the cronjob triggered
    for (let i = 0; i < priceChanges.length; i++) {
      // checks limits and runs an action event
      await run(priceChanges[i]);
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

  test('404 condition for limit order', async () => {
    memory.makerOrders.push({
      id: '404',
      pair: config.productID,
      side: 'buy',
    });
    currentDate.setHours(currentDate.getHours() + 1);
    await checkLimits({ dateOverride: currentDate });
    const expectedLog = getLog('err.limit404');
    expectedLog.forEach(l => {
      if (!l) return;
      logIndex++;
      expect(log.out[logIndex]).toEqual(l);
    });
  });
  test('Network failure during limit check', async () => {
    memory.makerOrders.push({
      id: 'fail',
      pair: config.productID,
      side: 'buy',
    });
    currentDate.setHours(currentDate.getHours() + 1);
    await checkLimits({ dateOverride: currentDate });
    const expectedLog = getLog('err.networkfail');
    expectedLog.forEach(l => {
      if (!l) return;
      logIndex++;
      expect(log.out[logIndex]).toEqual(l);
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
