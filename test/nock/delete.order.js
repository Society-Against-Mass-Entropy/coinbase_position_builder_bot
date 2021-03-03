const config = require('../../config');
const nock = require('nock');

module.exports = nock(config.api)
  .persist()
  .delete(/\/orders\/.+/)
  .reply(200);
