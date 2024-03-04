const config = require('../../config');
const memory = require('../../lib/memory');
const nock = require('nock');
const testConfig = require('../test.config');
const uuid = require('uuid');
const testMemory = require('../lib/test.memory');

const { divide, multiply, subtract } = require('../../lib/math');

module.exports = nock(config.api)
  .persist()
  .post('/api/v3/brokerage/orders')
  .reply(200, (uri, order) => {
    // console.log({ order });

    const order_id = uuid.v4();
    const isLimit =
      order.order_type === 'LIMIT' || order.order_configuration.limit_limit_gtc;

    if (!order.price)
      order.price =
        order?.order_configuration?.limit_limit_gtc?.limit_price ||
        testMemory.price;

    const isBuy = isLimit
      ? order.price < testMemory.price
      : order.order_configuration.market_market_ioc.quote_size;

    // console.log(
    //   `post.orders ${isLimit ? 'LIMIT' : 'MARKET'} order`,
    //   order.order_configuration
    // );
    let funds = Number(
      isLimit
        ? multiply(
            order.order_configuration.limit_limit_gtc.base_size,
            order.price
          )
        : isBuy
        ? order.order_configuration.market_market_ioc.quote_size
        : multiply(
            order.order_configuration.market_market_ioc.base_size,
            order.price
          )
    );

    const fees = multiply(funds, testConfig.feeRate);
    let executed = funds;

    if (isBuy) {
      executed = subtract(funds, fees);
      funds = executed;
    }
    order.size = isLimit ? Number(order.size) : divide(funds, order.price);

    // if (!isBuy) console.log(`post nock order`, order);
    // console.log({ order });
    const response = isLimit
      ? {
          order_configuration: order.order_configuration,
          average_filled_price: order.price,
          cancel_message: '',
          client_order_id: order_id,
          completion_percentage: '100',
          created_time: new Date().toISOString(),
          fee: '',
          filled_size: order.order_configuration.limit_limit_gtc.base_size,
          filled_value: funds,
          is_liquidation: false,
          last_fill_time: null,
          number_of_fills: '1',
          order_id,
          order_placement_source: 'RETAIL_ADVANCED',
          order_type: 'LIMIT',
          outstanding_hold_amount: '0',
          pending_cancel: false,
          product_id: config.productID,
          product_type: 'SPOT',
          reject_message: '',
          reject_reason: 'REJECT_REASON_UNSPECIFIED',
          settled: false,
          side: order.side,
          size_in_quote: false,
          size_inclusive_of_fees: false,
          status: 'OPEN',
          time_in_force: 'GOOD_UNTIL_CANCELLED',
          total_fees: fees.toFixed(16),
          total_value_after_fees: subtract(funds, fees),
          trigger_status: 'INVALID_ORDER_TYPE',
          user_id: '1',
        }
      : {
          order_configuration: order.order_configuration,
          average_filled_price: order.price,
          cancel_message: 'Internal error',
          client_order_id: order_id,
          completion_percentage: '100',
          created_time: new Date().toISOString(),
          fee: '',
          filled_size:
            order.side === 'SELL'
              ? order.order_configuration.market_market_ioc.base_size
              : order.size.toFixed(memory.product.precision),
          filled_value: funds,
          is_liquidation: false,
          last_fill_time: new Date().toISOString(),
          number_of_fills: '2',
          order_id,
          order_placement_source: 'RETAIL_ADVANCED',
          order_type: 'MARKET',
          outstanding_hold_amount: '0',
          pending_cancel: false,
          product_id: config.productID,
          product_type: 'SPOT',
          reject_message: '',
          reject_reason: 'REJECT_REASON_UNSPECIFIED',
          settled: true,
          side: order.side,
          size_in_quote: true,
          size_inclusive_of_fees: true,
          status: 'FILLED',
          time_in_force: 'IMMEDIATE_OR_CANCEL',
          total_fees: fees.toFixed(16),
          total_value_after_fees: subtract(funds, fees),
          trigger_status: 'INVALID_ORDER_TYPE',
          user_id: '1',
        };
    // cache this in memory so the get.order API can find the details of the order
    testMemory.orders[order_id] = response;
    // console.log(`post.orders memory`, JSON.stringify(testMemory.orders));
    // console.log(`post.orders response`, { response });
    return response;
  });
