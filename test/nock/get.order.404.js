const config = require('../../config');
const nock = require('nock');

module.exports = nock(config.api)
  .persist()
  .get('/api/v3/brokerage/orders/404')
  .reply(404, {});
