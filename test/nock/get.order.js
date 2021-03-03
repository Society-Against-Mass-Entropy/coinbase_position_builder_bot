const config = require('../../config');
const mockOrders = require('../lib/mock.orders');
const nock = require('nock');

module.exports = nock(config.api)
  .persist()
  .get(/\/order\/.+/)
  .reply(200, uri => {
    const id = uri.replace(config.api + '/order/', '');
    // console.log(`order id ${id}`, mockOrders[id]);
    return mockOrders[id] || [];
  });
