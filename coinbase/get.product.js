const config = require('../config');
const request = require('./cb.request');
const sleep = require('../lib/sleep');
const log = require('../lib/log');
const { productID } = require('../config');

module.exports = async () => {
  let retryCount = 0;
  const getProduct = async () => {
    // prevent rate limiting at startup and retries
    await sleep(config.sleep.product);
    if (retryCount) {
      log.zap(`retry #${retryCount} to get product info for #${productID}`);
    }
    const result = await request({
      requestPath: `/api/v3/brokerage/products/${productID}`,
      method: 'GET',
    });
    if (!result || !result.json) {
      retryCount++;
      return getProduct();
    }
    return result.json;
  };
  return getProduct();
};
