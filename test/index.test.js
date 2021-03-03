process.env.CPBB_TICKER = 'TEST';
// make it very unlikely the engine will run an action by itself while we are testing it
// we will run actions ourselves in testing
process.env.CPBB_FREQ = '1 1 1 1 1';
process.env.CPBB_TEST = true;
process.env.CPBB_APY = 1; // 1% to trigger tight change
const verbose = process.env.VERBOSE === true;
// allow test to run for up to 5 minutes
jest.setTimeout.Timeout = 300000;

const fs = require('fs');
const { version } = require('../package.json');

const consoleLogHistory = [];
const consoleWarnHistory = [];
const consoleErrorHistory = [];

console.log = (...args) => {
  const line = args.join(' ');
  consoleLogHistory.push(line);
  if (verbose) process.stdout.write('\n' + line);
};
console.warn = (...args) => {
  const line = args.join(' ');
  consoleWarnHistory.push(line);
  if (verbose) process.stdout.write('\n' + line);
};
console.error = (...args) => {
  const line = args.join(' ');
  consoleErrorHistory.push(line);
  if (verbose) process.stderr.write('\n' + line);
};

const config = require('../config');

require('./nock/delete.order');
require('./nock/get.accounts');
require('./nock/get.order');
require('./nock/get.product');
require('./nock/get.ticker');
require('./nock/post.orders');

const action = require('../lib/action');
const memory = require('../lib/memory');
const engine = require('../index');
const sleep = require('../lib/sleep');

describe('Engine', () => {
  beforeAll(async () => {
    // make sure everything loaded and started
    const app = await engine;
    // we will manually run action as if we are hitting cron timers
    app.stop();
    await sleep(2000);
    return;
  });

  test(`product loads`, () => {
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

  test(`boot status`, () => {
    expect(consoleLogHistory.length).toBeGreaterThan(0);
    expect(consoleLogHistory[0]).toEqual(
      expect.stringContaining('creating log file from template')
    );
    expect(consoleLogHistory[1]).toEqual(
      expect.stringContaining('creating maker file from template')
    );
    expect(consoleLogHistory[2]).toEqual(
      '🆗 TEST-USD online, min size 0.00100000, min funds 5 '
    );
    expect(consoleLogHistory[3]).toEqual(
      `🤖 Position Builder Bot ${version}, https://api-public.sandbox.pro.coinbase.com in LIVE mode, 10 $USD ➡️  $TEST @ cron(1 1 1 1 1), 1% APY`
    );
    expect(consoleLogHistory[4]).toEqual(
      '🏦 $USD account loaded with 9900.2266348066930000 (990 buy actions)'
    );
    expect(consoleLogHistory[5]).toEqual('✅ last transaction for TEST-USD:');
    expect(consoleLogHistory[6]).toEqual(
      expect.stringContaining(
        '0.00000000 TEST ➡️  0 USD @ 0 ✊ 0.00000000 @ 0.00 💧 gain 0.00 💧 basis 0.00 💵 0.00 💹 undefined 💸 <Infinity'
      )
    );
    expect(consoleLogHistory[7]).toEqual(
      expect.stringContaining('🕟 next run')
    );
  });

  test('makes a buy', async () => {
    await action();
    expect(consoleLogHistory[8]).toEqual(
      expect.stringContaining(
        '10 USD ➡️  0.00019900 TEST @ 50000.00 ✊ 0.00019900 @ 50251.26 💧 gain 0.00 💧 basis 50251.26 💵 0.00 💹 0.00% 💸 <50251.26'
      )
    );
  });

  test(`no error outputs`, () => {
    expect(consoleErrorHistory.length).toBe(0);
  });

  afterAll(() => {
    if (verbose) process.stdout.write('\n\n');
    // delete test output files
    fs.unlinkSync(`${__dirname}/../data/history.TEST-USD.sandbox.tsv`);
    fs.unlinkSync(`${__dirname}/../data/maker.orders.TEST-USD.sandbox.json`);
  });
});
