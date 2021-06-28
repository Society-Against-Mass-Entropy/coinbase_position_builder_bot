const config = require('../../config');
const nock = require('nock');
const testMemory = require('../lib/test.memory');

module.exports = nock(config.api)
  .persist()
  .get(/\/orders\/(?!404)(?!fail).+/)
  .reply(200, uri => {
    const id = uri.replace('/orders/', '');
    // console.log(JSON.stringify(testMemory.orders));
    const order = testMemory.orders[id];
    if (!order) {
      console.error('order not found', id);
      return;
    }
    const price = Number(testMemory.price);
    const target = Number(order.price);
    // console.log(`order id ${id}`, testMemory.price);
    if (order.side === 'sell' ? price >= target : price < target) {
      order.status = 'done';
      order.settled = true;
    }
    return order;
  });
