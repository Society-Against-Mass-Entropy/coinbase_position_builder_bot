const config = require('../../config');
const nock = require('nock');
const testMemory = require('../lib/test.memory');

module.exports = nock(config.api)
  .persist()
  .get(`/api/v3/brokerage/products/${config.productID}`)
  .reply(200, () => {
    const price = testMemory.price;
    // console.log(price);
    return {
      product_id: config.productID,
      price,
      display_name: `${config.ticker}/${config.currency}`,
      base_currency: config.ticker,
      quote_currency: config.currency,
      base_increment: '0.00000001',
      quote_increment: '0.01000000',
      quote_min_size: '1',
      quote_max_size: '50000000',
      base_min_size: '0.00100000',
      base_max_size: '280.00000000',
      min_market_funds: '5',
      max_market_funds: '1000000',
      status: 'online',
      cancel_only: false,
      limit_only: false,
      post_only: false,
      trading_disabled: false,
    };
  });
