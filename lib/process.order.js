const config = require('../config');
const uuid = require('uuid');
const order = require('../coinbase/order');
module.exports = async (action, retries = 0) => {
  const type = action.type || 'MARKET';
  // const side = action.funds > 0 ? 'BUY' : 'SELL';
  const orderConfig = {
    client_order_id: uuid.v4(),
    product_id: config.productID,
    side: action.side,
  };
  const opts =
    type === 'LIMIT'
      ? {
          ...orderConfig,
          order_configuration: {
            limit_limit_gtc: {
              base_size: action.size,
              limit_price: action.price,
              post_only: true,
            },
          },
        }
      : {
          // market
          ...orderConfig,
          order_configuration: {
            market_market_ioc: {
              quote_size:
                action.side === 'BUY' ? Math.abs(action.funds) + '' : undefined,
              base_size:
                action.side === 'SELL' ? Math.abs(action.size) + '' : undefined,
            },
          },
        };
  return order(opts, retries);
};
