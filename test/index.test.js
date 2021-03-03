process.env.CPBB_TICKER = 'TEST';
// make it very unlikely the engine will run an action by itself while we are testing it
// we will run actions ourselves in testing
process.env.CPBB_VOL = 100;
process.env.CPBB_FREQ = '1 1 1 1 1';
process.env.CPBB_TEST = true;
process.env.CPBB_APY = 25;
process.env.CPBB_REBUY_MAX = 50;
process.env.CPBB_REBUY_SIZE = '.0001,.0002,.0003,.0004,.0005';
process.env.CPBB_REBUY_AT = '-2,-4,-6,-8,-10';
process.env.CPBB_REBUY_CANCEL = 60 * 24 * 1;
process.env.CPBB_REBUY_REBUILD = 6;
// when should we cancel limit orders?
const verbose = process.env.VERBOSE_TEST === 'true';
// allow test to run for up to 5 minutes
jest.setTimeout.Timeout = 300000;

const fs = require('fs');

const consoleLogHistory = [];
const consoleWarnHistory = [];
const consoleErrorHistory = [];

console.log = (...args) => {
  const line = args
    .join(' ')
    .replace(
      /Position Builder Bot .+, http/,
      `Position Builder Bot [VERSION], http`
    )
    .replace(/\d{4}-\d{2}-\d{2}T[^\s]+\s/g, '[DATE] ')
    .replace(/next run .+ \d{4}-\d{2}-\d{2}T.+/, 'next run on [DATE]')
    .replace(/\s+$/, '')
    .replace(
      /from template .+history\.TEST-USD\.sandbox\.tsv/,
      'from template ./data/history.TEST-USD.sandbox.tsv'
    )
    .replace(
      /from template .+maker\.orders\.TEST-USD\.sandbox\.json/,
      'from template ./data/maker.orders.TEST-USD.sandbox.json'
    );
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

const exists = async file =>
  fs.promises
    .access(file)
    .then(() => true)
    .catch(() => false);

const config = require('../config');

require('./nock/delete.order');
require('./nock/get.accounts');
require('./nock/get.order');
require('./nock/get.product');
require('./nock/get.ticker');
require('./nock/post.orders');

const action = require('../lib/action');
const testMemory = require('./lib/test.memory');
const memory = require('../lib/memory');
const engine = require('../index');
const sleep = require('../lib/sleep');
const logBoot = fs
  .readFileSync(`${__dirname}/data/output.00.boot.log`)
  .toString()
  .split('\n');
const logBuy = fs
  .readFileSync(`${__dirname}/data/output.01.buy.log`)
  .toString()
  .split('\n');
const logSell = fs
  .readFileSync(`${__dirname}/data/output.02.sell.log`)
  .toString()
  .split('\n');
const logRebuy = fs
  .readFileSync(`${__dirname}/data/output.03.rebuy.log`)
  .toString()
  .split('\n');
const logRebuild = fs
  .readFileSync(`${__dirname}/data/output.04.rebuild.log`)
  .toString()
  .split('\n');
const logRebuyFill = fs
  .readFileSync(`${__dirname}/data/output.05.rebuy.fill.log`)
  .toString()
  .split('\n');

let logIndex = 0;

describe('Engine', () => {
  beforeAll(async () => {
    // make sure everything loaded and started
    const app = await engine;
    // we will manually run action as if we are hitting cron timers
    app.stop();
    await sleep(2000);

    // mock market conditions and actions as if the cronjob triggered
    testMemory.price = '50000';
    await action();
    testMemory.price = '51000';
    await action();
    testMemory.price = '52000';
    await action();
    testMemory.price = '53000';
    await action();
    testMemory.price = '54000';
    await action();
    testMemory.price = '55000';
    await action();
    testMemory.price = '56000';
    await action();
    testMemory.price = '58000';
    await action();
    testMemory.price = '70000';
    await action();
    testMemory.price = '71000';
    await action();
    testMemory.price = '72000';
    await action();
    testMemory.price = '66000';
    await action();
    return;
  });

  test(`product loads`, () => {
    expect(memory.product.base_min_size).toEqual('0.00100000');
  });

  test(`creates history/maker files`, async () => {
    const historyFileExists = await exists(config.history_file);
    const makerFileExists = await exists(config.maker_file);
    expect(historyFileExists).toBeTruthy();
    expect(makerFileExists).toBeTruthy();
    expect(consoleLogHistory.length).toBeGreaterThan(0);
  });

  test(`boot status`, () => {
    logBoot.forEach(l => {
      if (!l) return;
      expect(consoleLogHistory[logIndex]).toEqual(l);
      logIndex++;
    });
  });

  test('Market BUY', async () => {
    logBuy.forEach(l => {
      if (!l) return;
      expect(consoleLogHistory[logIndex]).toEqual(l);
      logIndex++;
    });
  });
  test('Market SELL', async () => {
    logSell.forEach(l => {
      if (!l) return;
      expect(consoleLogHistory[logIndex]).toEqual(l);
      logIndex++;
    });
  });
  test('Limit Rebuy Set', async () => {
    logRebuy.forEach(l => {
      if (!l) return;
      expect(consoleLogHistory[logIndex]).toEqual(l);
      logIndex++;
    });
  });
  test('Limit Rebuy Rebuild', async () => {
    logRebuild.forEach(l => {
      if (!l) return;
      expect(consoleLogHistory[logIndex]).toEqual(l);
      logIndex++;
    });
  });
  test('Limit Rebuy Fill', async () => {
    logRebuyFill.forEach(l => {
      if (!l) return;
      expect(consoleLogHistory[logIndex]).toEqual(l);
      logIndex++;
    });
  });

  test(`no error outputs`, () => {
    expect(consoleWarnHistory.length).toBe(0);
    expect(consoleErrorHistory.length).toBe(0);
  });

  afterAll(() => {
    if (verbose) process.stdout.write('\n\n');
    // delete test output files
    fs.unlinkSync(`${__dirname}/../data/history.TEST-USD.sandbox.tsv`);
    fs.unlinkSync(`${__dirname}/../data/maker.orders.TEST-USD.sandbox.json`);
  });
});
