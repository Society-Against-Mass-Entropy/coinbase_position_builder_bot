const config = require('../../config');
const nock = require('nock');
const getPrice = require('../lib/get.price');
const { add, subtract } = require('../../lib/math');

module.exports = nock(config.api)
  .get('/products/TEST-USD/ticker')
  .reply(200, () => {
    const price = getPrice();
    console.log(price);
    const payload = {
      trade_id: 4729088,
      price,
      size: '0.193',
      bid: subtract(price, 0.01),
      ask: add(price, 0.01),
      volume: '5957.11914015',
      time: new Date().toISOString(),
    };
    return payload;
  });
