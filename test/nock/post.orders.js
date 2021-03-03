const config = require('../../config');
const nock = require('nock');
const testConfig = require('../test.config');
const getID = require('../lib/get.id');
const mockOrders = require('../lib/mock.orders');
const testMemory = require('../lib/test.memory');

const { divide, multiply, subtract } = require('../../lib/math');

module.exports = nock(config.api)
  .persist()
  .post('/orders')
  .reply(200, (uri, order) => {
    // console.log(JSON.stringify(order));
    const id = getID();
    const isLimit = order.type === 'limit';
    let funds = Number(
      isLimit ? multiply(order.size, order.price) : order.funds
    );
    let fees = multiply(funds, testConfig.feeRate);
    let executed = funds;

    if (order.side === 'buy') {
      executed = subtract(funds, fees);
      funds = executed;
    }
    if (!order.price) {
      order.price = testMemory.price;
    }
    order.size = isLimit ? order.size : divide(executed, order.price);
    const response = {
      id,
      size: order.size.toFixed(8),
      product_id: config.productID,
      side: order.side,
      funds: isLimit ? undefined : funds.toFixed(16),
      price: isLimit ? order.price : undefined,
      specified_funds: funds.toFixed(16),
      type: order.type,
      post_only: isLimit,
      created_at: new Date().toISOString(),
      done_at: new Date().toISOString(),
      fill_fees: fees.toFixed(16),
      filled_size: order.size.toFixed(8),
      executed_value: executed.toFixed(16),
      status: isLimit ? 'posted' : 'done',
      settled: !isLimit,
    };
    // cache this in memory so the get.order API can find the details of the order
    if (isLimit) mockOrders[id] = response;
    // console.log(JSON.stringify(mockOrders));
    // console.log({ response });
    return response;
  });
