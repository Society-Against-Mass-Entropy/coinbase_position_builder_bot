const request = require("./cb.request");
const config = require("../config");
const memory = require("../data/memory");

module.exports = async () => {
  const data = await request({
    requestPath: `/products/${config.productID}/ticker`,
    method: "GET",
  });
  // store the latest price
  memory.price = Number(data.price);
  return data;
};
