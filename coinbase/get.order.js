const log = require("../lib/log");
const request = require("./cb.request");
const sleep = require("../lib/sleep");
const RETRY_TIMES = 360; // 60 minutes worth of 10 second intervals
module.exports = async order => {
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
        `API is slow! Order ${order.id} is pending! 404 is normal. We will retry every 10 seconds for up to 1 hour...`
      );
      log.debug(`retry #${retryCount} on order #${order.id}`);
    }
    const opts = {
      requestPath: `/orders/${order.id}`,
      method: "GET",
    };
    log.debug(opts);
    const response = await request(opts);
    log.debug(response);
    const json = response ? response.json : response;
    // NOTE: we allow limit orders to be unsettled and even not found (sometimes limits get purged due to maintenance or other conditions)
    if (
      order.type === "market" &&
      (!json || !json.settled || json.message === "NotFound")
    ) {
      retryCount++;
      if (retryCount > RETRY_TIMES) {
        log.error(`failed to get order ${order.id}`, { order, json });
        return Promise.reject("failed to get complete order");
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
          `API slowdown: Order ${order.id} took ${timeString} to update status!`
        );
      }
    }
    return json;
  };

  return getCompletedOrder();
};
