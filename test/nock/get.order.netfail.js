const config = require('../../config');
const nock = require('nock');

module.exports = nock(config.api)
  .persist()
  .get(/\/orders\/fail/)
  .replyWithError('ENOTFOUND');
