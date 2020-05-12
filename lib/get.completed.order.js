const getOrder = require("../coinbase/get.order");
const log = require("./log");

module.exports = async (orderResponse) => {
  if (orderResponse.settled) {
    return orderResponse; // immediate fill
  }
  // we need to call back to ask for the details
  return retry(
    {
      times: 60,
      interval: function (retryCount) {
        return 50 * Math.pow(2, retryCount);
      },
    },
    async () => {
      log(`delayed settlement: getting order details`, orderResponse.id);
      const orderResponse = await getOrder(orderResponse.id);
      if (
        !orderResponse ||
        !orderResponse.settled ||
        orderResponse.message === "NotFound"
      ) {
        throw "order delayed";
      }
      return orderResponse;
    }
  );
};
