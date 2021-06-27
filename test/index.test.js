// TEST CONFIG
process.env.CPBB_TICKER = 'TEST';
process.env.CPBB_CURRENCY = 'USD';
process.env.CPBB_VOL = 100;
process.env.CPBB_FREQ = '1 1 1 1 1';
process.env.CPBB_APY = 25;
process.env.CPBB_REBUY_MAX = 50;
process.env.CPBB_REBUY = '.0001@2,.0002@4,.0003@6,.0004@8,.0005@10';
process.env.CPBB_RESELL_MAX = 50;
process.env.CPBB_RESELL = '.0001@2,.0002@4,.0003@6,.0004@8,.0005@10';
process.env.FIRST_LOG_DATE = '2021-01-01T00:00:00.000Z';
// process.env.CPBB_REBUY_SIZE = '.0001,.0002,.0003,.0004,.0005';
// process.env.CPBB_REBUY_AT = '-2,-4,-6,-8,-10';
process.env.CPBB_REBUY_CANCEL = 60 * 24 * 1;
process.env.CPBB_REBUY_REBUILD = 6;

const deleteOutputFiles = () => {
  const historyFile = `${__dirname}/../data/history.${process.env.CPBB_TICKER}-${process.env.CPBB_CURRENCY}.sandbox.tsv`;
  const ordersFile = `${__dirname}/../data/maker.orders.${process.env.CPBB_TICKER}-${process.env.CPBB_CURRENCY}.sandbox.json`;
  if (fs.existsSync(historyFile)) fs.unlinkSync(historyFile);
  if (fs.existsSync(ordersFile)) fs.unlinkSync(ordersFile);
};

const priceChanges = [
  // buy, set resell orders
  '50000',
  '51000',
  '52000',
  '53000',
  '54000',
  '55000',
  '56000',
  '58000',
  // sell (over APY), creates rebuy orders
  '70000',
  // rebuys have more time, sell, create more rebuy limits (rebuild rebuys)
  '71000',
  // now enought time has passed to make our APY target buy this price
  // trigger resell limits
  '72000',
  // trigger rebuy limits
  '66000',
  '65000',
  '64000',
  '63000',
  '69000',
];

// a list of filenames in ./data/output.${name}.log that group
// chunks of expected stdout from the app
const logExpectations = [
  '00.boot',
  '01.buy',
  '02.sell',
  '03.rebuy',
  '04.rebuild',
  '05.rebuy.fill',
  '06.resell',
  '07.resell.fill',
];

// END TEST CONFIG

process.env.CPBB_TEST = true;
const verbose = process.env.VERBOSE_TEST === 'true';

// this must be included before loading anything else so we can capture console.log output
const log = require('./lib/log');

require('./nock/delete.order');
require('./nock/get.accounts');
require('./nock/get.order');
require('./nock/get.order.netfail');
require('./nock/get.order.404');
require('./nock/get.product');
require('./nock/get.ticker');
require('./nock/post.orders');

const fs = require('fs');

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
