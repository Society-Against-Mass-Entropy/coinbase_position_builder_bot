const config = require('../../config');
const nock = require('nock');

module.exports = nock(config.api)
  .delete(/\/orders\/.+/)
  .reply(200);
