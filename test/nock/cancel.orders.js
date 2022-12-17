const config = require('../../config');
const nock = require('nock');

module.exports = nock(config.api)
  .persist()
  .post(`/api/v3/brokerage/orders/batch_cancel`)
  .reply(200, {});
