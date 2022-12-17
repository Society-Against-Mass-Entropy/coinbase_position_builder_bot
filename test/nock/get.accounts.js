const config = require('../../config');
const nock = require('nock');

module.exports = nock(config.api)
  .get('/api/v3/brokerage/accounts?limit=250')
  .reply(200, {
    accounts: [
      {
        id: '1',
        currency: 'TEST',
        available_balance: { value: '0.0000000000000000' },
        hold: { value: '0.0000000000000000' },
        profile_id: '1',
        trading_enabled: true,
      },
      {
        id: '2',
        currency: 'USD',
        available_balance: { value: '99000.2266348066930000' },
        hold: { value: '1000.0035025000000000' },
        profile_id: '1',
        trading_enabled: true,
      },
    ],
  });
