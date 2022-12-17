const config = require('../../config');
const nock = require('nock');
const testMemory = require('../lib/test.memory');
const { add, subtract } = require('../../lib/math');

module.exports = nock(config.api)
  .persist()
  .get('/api/v3/brokerage/products/TEST-USD/ticker')
  .reply(200, () => {
    const price = testMemory.price;
    // console.log(price);
    return {
      trades: {
        trade_id: 4729088,
        price,
        size: '0.193',
        bid: subtract(price, 0.01),
        ask: add(price, 0.01),
        volume: '5957.11914015',
        time: new Date().toISOString(),
      },
    };
  });
