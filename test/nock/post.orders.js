const config = require('../../config');
const nock = require('nock');
const testConfig = require('../test.config');
const getID = require('../lib/get.id');

const { divide, multiply, subtract } = require('../../lib/math');

module.exports = nock(config.api)
  .post('/orders')
  .reply(200, (uri, order) => {
    if (order.type === 'market') {
      order.price = testConfig.price;
      order.size = divide(order.funds, order.price);
    }
    const funds = multiply(order.size, order.price);
    const fees = multiply(funds, testConfig.feeRate);
    const executed = subtract(funds, fees);
    const response = {
      id: getID(),
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
    // console.log({ response });
    return response;
  });
