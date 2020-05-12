const request = require("./cb.request");
const retry = require("async.retry");

module.exports = async (id) => {
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
      const orderResponse = await request({
        requestPath: `/orders/${id}`,
        method: "GET",
      });
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
