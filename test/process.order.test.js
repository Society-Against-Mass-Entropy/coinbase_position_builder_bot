/**
 * this test is entirely BS since we are using a process.order mock,
 * so we are really just expecting that the test outputs the mock
 *
 * Leaving this here as an example of why mocks are a little silly if we are testing
 * at granular module level
 * TODO: test at a higher level
 */
const config = require('../config');
const testConfig = require('../test/test.config');
const { multiply, subtract } = require('../lib/math');

const processOrder = require('../lib/process.order');

jest.mock('../coinbase/order');

test('processOrder: limit', async () => {
  const opts = {
    funds: 500,
    price: testConfig.price,
    size: 0.01,
    type: 'limit',
  };
  // request.mockResolvedValue(response);
  const order = await processOrder(opts);
  const funds = multiply(opts.size, opts.price);
  const fees = multiply(funds, testConfig.feeRate);
  const executed = subtract(funds, fees);
  expect(order).toEqual({
    id: '68e6a28f-ae28-4788-8d4f-5ab4e5e5ae08',
    size: opts.size.toFixed(8),
    product_id: config.productID,
    side: 'buy',
    stp: 'dc',
    funds: executed.toFixed(16),
    specified_funds: funds.toFixed(16),
    type: opts.type,
    post_only: false,
    created_at: order.created_at,
    done_at: order.done_at,
    done_reason: 'filled',
    fill_fees: fees.toFixed(16),
    filled_size: opts.size.toFixed(8),
    executed_value: executed.toFixed(16),
    status: 'done',
    settled: true,
  });
});

test('processOrder: market', async () => {
  const opts = {
    funds: 500,
    size: 0.01,
    type: 'market',
  };
  const order = await processOrder(opts);
  const funds = multiply(opts.size, testConfig.price);
  const fees = multiply(funds, testConfig.feeRate);
  const executed = subtract(funds, fees);
  expect(order).toEqual({
    id: '68e6a28f-ae28-4788-8d4f-5ab4e5e5ae08',
    size: opts.size.toFixed(8),
    product_id: config.productID,
    side: 'buy',
    stp: 'dc',
    funds: executed.toFixed(16),
    specified_funds: funds.toFixed(16),
    type: opts.type,
    post_only: false,
    created_at: order.created_at,
    done_at: order.done_at,
    done_reason: 'filled',
    fill_fees: fees.toFixed(16),
    filled_size: opts.size.toFixed(8),
    executed_value: executed.toFixed(16),
    status: 'done',
    settled: true,
  });
});
