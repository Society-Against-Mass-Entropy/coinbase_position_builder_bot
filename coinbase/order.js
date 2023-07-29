// https://docs.coinbase.com/?javascript#place-a-new-order

const { divide, multiply } = require('../lib/math');
const config = require('../config');
const memory = require('../lib/memory');
const log = require('../lib/log');
const request = require('./cb.request');
const sleep = require('../lib/sleep');

module.exports = async (opts, retries = 0) => {
  if (config.dry) {
    // fake out a .5% fee subtraction (worst case tier)
    const converted = multiply(opts.funds, 0.995);
    return {
      filled_value: Number(opts.funds),
      filled_size: divide(converted, memory.price, 8),
      total_fees: multiply(opts.funds, 0.005),
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
    const { reason, json } = await request({
      requestPath: '/api/v3/brokerage/orders',
      method: 'POST',
      body: opts,
    });
    if (
      reason === 400 &&
      json &&
      json.failure_reason === 'INSUFFICIENT_FUNDS'
    ) {
      log.error('Check account balance! Out of funds!');
      return;
    }
    log.debug(reason, json);
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
