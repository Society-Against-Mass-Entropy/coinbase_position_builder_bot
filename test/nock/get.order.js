const config = require('../../config');
const mockOrders = require('../lib/mock.orders');
const nock = require('nock');
const testMemory = require('../lib/test.memory');

module.exports = nock(config.api)
  .persist()
  .get(/\/orders\/.+/)
  .reply(200, uri => {
    const id = uri.replace('/orders/', '');
    // console.log(JSON.stringify(mockOrders));
    const order = mockOrders[id];
    if (!order) {
      console.error('order not found', id);
      return;
    }
    // console.log(`order id ${id}`, testMemory.price);
    if (Number(testMemory.price) < Number(order.price)) {
      order.status = 'done';
      order.settled = true;
    }
    return order;
  });
