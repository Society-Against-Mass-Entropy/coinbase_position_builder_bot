const log = require("../lib/log");
const request = require("./cb.request");
const sleep = require("../lib/sleep");
const RETRY_TIMES = 720; // 60 minutes worth of 5 second intervals
module.exports = async (order) => {
  let retryCount = 0;
  let time = 5000;
  const getCompletedOrder = async () => {
    if (retryCount)
      log.debug(`retry #${retryCount} on order #${order.id}`);
    const orderResponse = await request({
      requestPath: `/orders/${order.id}`,
      method: "GET",
    });
    if (
      !orderResponse ||
      !orderResponse.settled ||
      orderResponse.message === "NotFound"
    ) {
      retryCount++;
      if (retryCount > RETRY_TIMES) {
        log.error(`failed to get order ${order.id}`, JSON.stringify(order));
        return Promise.reject("failed to get complete order");
      }
      await sleep(time);
      return getCompletedOrder();
    }
    return orderResponse;
  };

  return getCompletedOrder();
};
