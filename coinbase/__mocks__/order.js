const config = require('../../config');
const { divide, multiply, subtract } = require('../../lib/math');
const testConfig = require('../../test/test.config');
module.exports = order => {
  if (order.type === 'market') {
    order.price = testConfig.price;
    order.size = divide(order.funds, order.price);
  }
  const funds = multiply(order.size, order.price);
  const fees = multiply(funds, testConfig.feeRate);
  const executed = subtract(funds, fees);
  return {
    id: '68e6a28f-ae28-4788-8d4f-5ab4e5e5ae08',
    size: order.size.toFixed(8),
    product_id: config.productID,
    side: order.side,
    stp: 'dc',
    funds: executed.toFixed(16),
    specified_funds: funds.toFixed(16),
    type: order.type,
    post_only: false,
    created_at: new Date().toISOString(),
    done_at: new Date().toISOString(),
    done_reason: 'filled',
    fill_fees: fees.toFixed(16),
    filled_size: order.size.toFixed(8),
    executed_value: executed.toFixed(16),
    status: 'done',
    settled: true,
  };
};
