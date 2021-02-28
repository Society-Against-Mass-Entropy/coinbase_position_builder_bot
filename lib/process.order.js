const config = require('../config');
const order = require('../coinbase/order');
module.exports = async action => {
  const type = action.type || 'market';
  const side = action.funds > 0 ? 'buy' : 'sell';
  const opts =
    type === 'limit'
      ? {
          size: action.size,
          post_only: true,
          price: action.price,
          product_id: config.productID,
          side,
          type,
        }
      : {
          // market
          funds: Math.abs(action.funds) + '',
          product_id: config.productID,
          side,
          type,
        };
  return order(opts);
};
