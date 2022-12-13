const config = require('../../config');
const nock = require('nock');

module.exports = nock(config.api)
  .persist()
  .post(/\/orders\/batch_cancel\/.+/)
  .reply(200, {});
