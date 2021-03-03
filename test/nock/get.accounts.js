const config = require('../../config');
const nock = require('nock');

module.exports = nock(config.api)
  .get('/accounts')
  .reply(200, [
    {
      id: '1',
      currency: 'TEST',
      balance: '0.0000000000000000',
      available: '0.0000000000000000',
      hold: '0.0000000000000000',
      profile_id: '1',
      trading_enabled: true,
    },
    {
      id: '2',
      currency: 'USD',
      balance: '10000.2301373066930000',
      available: '9900.2266348066930000',
      hold: '100.0035025000000000',
      profile_id: '1',
      trading_enabled: true,
    },
  ]);
