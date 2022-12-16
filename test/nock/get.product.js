const config = require('../../config');
const nock = require('nock');

module.exports = nock(config.api)
  .get(`/api/v3/brokerage/products/${config.productID}`)
  .reply(200, {
    id: config.productID,
    display_name: `${config.ticker}/${config.currency}`,
    base_currency: config.ticker,
    quote_currency: config.currency,
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
