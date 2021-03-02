process.env.CPBB_TICKER = 'TEST';
process.env.CPBB_TEST = true;
// test mode kicks off every 10 seconds to kick off a job
process.env.CPBB_FREQ = '*/10 * * * *';
// allow test to run for up to 5 minutes
jest.setTimeout.Timeout = 300000;

const fs = require('fs');
const config = require('../config');

require('./nock/delete.order');
require('./nock/get.accounts');
require('./nock/get.order');
require('./nock/get.product');
require('./nock/get.ticker');
require('./nock/post.orders');

const memory = require('../lib/memory');
const app = require('../index');
const sleep = require('../lib/sleep');

beforeAll(async () => {
  // give the engine time to load up ticker/account, and start cron
  await sleep(2000);
  return true;
});

test(`product loads`, async () => {
  expect(memory.product.base_min_size).toEqual('0.00100000');
});

test(`creates history/maker files`, async () => {
  const historyFileExists = await fs.promises
    .access(config.history_file)
    .then(() => true)
    .catch(() => false);
  const makerFileExists = await fs.promises
    .access(config.maker_file)
    .then(() => true)
    .catch(() => false);
  expect(historyFileExists).toBeTruthy();
  expect(makerFileExists).toBeTruthy();
});

test(`makes a buy order`, async () => {
  await sleep(5000);
  expect(memory.lastLog.Funds).toEqual(10);
});

afterAll(() => {
  app.stop();
});
