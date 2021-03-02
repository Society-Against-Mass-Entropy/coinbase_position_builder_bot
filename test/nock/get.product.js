const config = require('../../config');
const nock = require('nock');

module.exports = nock(config.api).get('/products/TEST-USD').reply(200, {
  id: 'TEST-USD',
  display_name: 'TEST/USD',
  base_currency: 'TEST',
  quote_currency: 'USD',
  base_increment: '0.00000001',
  quote_increment: '0.01000000',
  base_min_size: '0.00100000',
  base_max_size: '280.00000000',
  min_market_funds: '5',
  max_market_funds: '1000000',
  status: 'online',
  status_message: '',
  cancel_only: false,
  limit_only: false,
  post_only: false,
  trading_disabled: false,
});
