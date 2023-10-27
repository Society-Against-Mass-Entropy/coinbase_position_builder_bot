// https://docs.cloud.coinbase.com/advanced-trade-api/reference/retailbrokerageapi_cancelorders

const config = require('../config');
const request = require('./cb.request');
const sleep = require('../lib/sleep');
const log = require('../lib/log');

module.exports = async ids => {
  if (config.dry) return true;
  let retryCount = 0;
  const cancelOrders = async () => {
    if (retryCount) {
      log.zap(`retry #${retryCount} to cancel orders`);
    }
    const result = await request({
      requestPath: `/api/v3/brokerage/orders/batch_cancel`,
      method: 'POST',
      body: { order_ids: ids }, // array of strings
    });
    if (!result || !result.json) {
      retryCount++;
      await sleep(config.sleep.product);
      return cancelOrders();
    }
    return result.json.results;
  };
  return cancelOrders();
};
