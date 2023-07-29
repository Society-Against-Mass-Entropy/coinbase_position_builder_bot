const config = require('../../config');
const nock = require('nock');
const testMemory = require('../lib/test.memory');
const log = require('../../lib/log');

module.exports = nock(config.api)
  .persist()
  .get(/\/api\/v3\/brokerage\/orders\/historical\/(?!404)(?!fail).+/)
  .reply(200, uri => {
    const id = uri.replace('/api/v3/brokerage/orders/historical/', '');
    // console.log(Object.keys(testMemory.orders).map(id => id.replace('-', '')));
    const order = testMemory.orders[id];
    log.debug(`getOrder (nock)`, uri, id, order);
    if (!order) {
      console.error('order not found in testMemory', id);
      return;
    }

    // console.log(`order id ${id}`, testMemory.price);
    if (order.order_type === 'LIMIT') {
      const price = Number(
        order.order_configuration.limit_limit_gtc.limit_price
      );
      log.debug(
        `ORDER INFO`,
        order.side,
        testMemory.high,
        price,
        testMemory.low
      );
      if (
        (order.side === 'SELL' && testMemory.high > price) ||
        testMemory.low <= price
      ) {
        log.debug(`ORDER EXECUTED`);
        order.status = 'FILLED';
        order.settled = true;
      }
      // } else {
      //   if (
      //     order.side === 'SELL'
      //       ? testMemory.high > order.average_filled_price
      //       : testMemory.low < order.average_filled_price
      //   ) {
      //     order.status = 'FILLED';
      //     order.settled = true;
      //     // delete testMemory.orders[id];
      //   }
    }
    // console.log(`nock order`, order);
    log.debug(`getOrder (nock) result`, order);
    return { order };
  });
