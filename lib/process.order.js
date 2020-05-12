const config = require("../config");
const order = require("../coinbase/order");
module.exports = async (action) =>
  order({
    type: "market",
    side: action.funds > 0 ? "buy" : "sell",
    funds: Math.abs(action.funds) + "",
    product_id: config.productID,
  });
