const log = require("../lib/log");
const request = require("./cb.request");
const sleep = require("../lib/sleep");
const RETRY_TIMES = 10;
const RETRY_MULTIPLIER = 2;
module.exports = async (id) => {
  let retryCount = 1;
  let time = 100;
  const getCompletedOrder = async () => {
    if (retryCount > 5)
      log.now(`status attempt #${retryCount} on order #${id}`);
    const orderResponse = await request({
      requestPath: `/orders/${id}`,
      method: "GET",
    });
    if (
      !orderResponse ||
      !orderResponse.settled ||
      orderResponse.message === "NotFound"
    ) {
      retryCount++;
      if (retryCount > RETRY_TIMES) {
        log.error(`failed to get order ${id}`);
        return Promise.reject("failed to get complete order");
      }
      time = time * RETRY_MULTIPLIER;
      await sleep(time);
      return getCompletedOrder();
    }
    return orderResponse;
  };

  return getCompletedOrder();
};
