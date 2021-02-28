process.env.CPBB_TICKER = 'TEST';
process.env.CPBB_TEST = true;
// test mode kicks off every 5 seconds to kick off a job
process.env.CPBB_FREQ = '*/10 * * * *';
// allow test to run for up to 5 minutes
jest.setTimeout.Timeout = 300000;

const fs = require('fs');

const config = require('../config');
const app = require('../index');
const sleep = require('../lib/sleep');

jest.mock('../coinbase/accounts');
jest.mock('../coinbase/delete.order');
jest.mock('../coinbase/get.order');
jest.mock('../coinbase/get.ticker');
jest.mock('../coinbase/order');

test(`app creates history/maker files`, async () => {
  await sleep(1000);
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
  app.stop();
});
