// https://docs.pro.coinbase.com/?javascript#place-a-new-order

const { divide, multiply } = require('../lib/math');
const config = require('../config');
const memory = require('../lib/memory');
const log = require('../lib/log');
const numFix = require('../lib/number.fix');
const request = require('./cb.request');
const sleep = require('../lib/sleep');

module.exports = async (opts, retries = 0) => {
  if (config.dry) {
    // fake out a .5% fee subtraction (worst case tier)
    const converted = multiply(opts.funds, 0.995);
    return {
      executed_value: Number(opts.funds),
      filled_size: numFix(divide(converted, memory.price), 8),
      fill_fees: multiply(opts.funds, 0.005),
      settled: true,
    };
  }
  if (process.env.LOG_CORRECTION) {
    return {
      filled_size: process.env.LOG_CORRECTION,
      settled: true,
    };
  }

  let retryCount = 0;
  let time = 100;
  const attemptOrder = async () => {
    if (retryCount) {
      // if we had something like an ENETDOWN error, try again after a bit
      time = 5000; // extend future retries to 5 seconds
    }
    if (retryCount === 2) {
      log.now(`retry #${retryCount}`, opts);
    }
    const result = await request({
      requestPath: '/orders',
      method: 'POST',
      body: opts,
    });
    log.debug(result);
    const json = result ? result.json : result;
    // if retries are enabled for this type of order, allow retry
    if (retries && !json) {
      retryCount++;
      if (retryCount > retries) {
        log.error(`failed to place order`, { opts, json });
        return false;
      }
      await sleep(time);
      return attemptOrder();
    }
    return json;
  };

  return attemptOrder();
};
