const config = require('../config');
const request = require('./cb.request');
const sleep = require('../lib/sleep');
const log = require('../lib/log');

module.exports = async () => {
  let retryCount = 0;
  const getProducts = async () => {
    // prevent rate limiting at startup and retries
    await sleep(config.sleep.product);
    if (retryCount) {
      log.zap(`retry #${retryCount} to get products`);
    }
    const result = await request({
      requestPath: `/api/v3/brokerage/products`,
      method: 'GET',
    });
    if (!result?.json?.products) {
      return getProducts();
    }
    return result.json.products;
  };
  return getProducts();
};
