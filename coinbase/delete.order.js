// https://docs.pro.coinbase.com/#cancel-an-order

const request = require("./cb.request");

module.exports = async (id) => {
  if (process.env.CPBB_DRY_RUN) {
    return true;
  }
  return request({
    requestPath: `/orders/${id}`,
    method: "DELETE"
  });
};
