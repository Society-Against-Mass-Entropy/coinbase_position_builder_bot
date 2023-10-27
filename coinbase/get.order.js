const log = require('../lib/log');
const request = require('./cb.request');
const sleep = require('../lib/sleep');
const RETRY_TIMES = 360; // 60 minutes worth of 10 second intervals
module.exports = async order => {
  if (!order.order_id) return log.error(`no order id in order`, order);
  let retryCount = 0;
  // intially, the order may have gone in and just not completed immediately
  // so we just need to call back to get the details:
  let time = 100;
  const getCompletedOrder = async () => {
    if (retryCount) {
      // we may need to wait a while
      // sometimes this takes up to 15 minutes if the API is super bogged down
      time = 10000; // extend future retries to 10 seconds
    }
    if (retryCount === 2) {
      log.zap(
        `API is slow! Order ${order.order_id} is pending! 404 is normal. We will retry every 10 seconds for up to 1 hour...`
      );
      log.debug(`retry #${retryCount} on order #${order.order_id}`);
    }
    const opts = {
      requestPath: `/api/v3/brokerage/orders/historical/${order.order_id}`,
      method: 'GET',
    };
    log.debug(order.order_id, opts);
    const result = await request(opts);
    const json = result?.json?.order;
    // log.ok(order.order_id, { json });
    // NOTE: we allow limit orders to be unsettled and even not found (sometimes limits get purged due to maintenance or other conditions)
    if (
      !['404', 'fail'].includes(order.order_id) &&
      (!json ||
        (json?.order_type === 'MARKET' && json?.status !== 'FILLED') ||
        json.message === 'NotFound')
    ) {
      retryCount++;
      // log.error(`retry`, json);
      if (retryCount > RETRY_TIMES) {
        log.error(`failed to get order ${order.order_id}`, { order, json });
        return Promise.reject('failed to get complete order');
      }
      await sleep(time);
      return getCompletedOrder();
    }
    if (retryCount) {
      const elapsed = (retryCount * time) / 1000;
      if (elapsed > 60) {
        // only log this alert if the delay was longer than 1 minute
        const timeString =
          elapsed > 60 ? `${elapsed / 60} minutes` : `${elapsed} seconds`;
        log.zap(
          `API slowdown: Order ${order.order_id} took ${timeString} to update status!`
        );
      }
    }
    return result;
  };

  return getCompletedOrder();
};
