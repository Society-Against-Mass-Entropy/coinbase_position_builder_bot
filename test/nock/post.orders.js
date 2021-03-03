const config = require('../../config');
const nock = require('nock');
const testConfig = require('../test.config');
const getID = require('../lib/get.id');
const getPrice = require('../lib/get.price');
const mockOrders = require('../lib/mock.orders');

const { divide, multiply, subtract } = require('../../lib/math');

module.exports = nock(config.api)
  .persist()
  .post('/orders')
  .reply(200, (uri, order) => {
    // console.log({ order });
    if (order.type === 'market') {
      order.price = getPrice();
      order.size = divide(order.funds, order.price);
      // }else{
      // order.size = multiply(executed, order.price);
    }
    const funds = multiply(order.size, order.price);
    const fees = multiply(funds, testConfig.feeRate);
    const executed = subtract(funds, fees);
    order.size = divide(executed, order.price);

    // console.log({ funds, fees, executed, order });
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
    // cache this in memory so the get.order API can find the details of the order
    mockOrders.id = response;
    // console.log({ response });
    return response;
  });
