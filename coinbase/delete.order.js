// https://docs.pro.coinbase.com/#cancel-an-order

const config = require('../config');
const request = require("./cb.request");

module.exports = async (id) => {
  if (config.dry) return true;
  const response = await request({
    requestPath: `/orders/${id}`,
    method: "DELETE"
  });

  return response ? response.json : undefined;
};
