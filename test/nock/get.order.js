const config = require('../../config');
const nock = require('nock');

module.exports = nock(config.api)
  .get(/\/order\/.+/)
  .reply(200, uri => {
    const id = uri.replace(config.api + '/order/', '');
    return {
      id: id,
      size: '1.00000000',
      product_id: 'TEST-USD',
      side: 'buy',
      stp: 'dc',
      funds: '9.9750623400000000',
      specified_funds: '10.0000000000000000',
      type: 'market',
      post_only: false,
      created_at: new Date().toISOString(),
      done_at: new Date().toISOString(),
      done_reason: 'filled',
      fill_fees: '0.0249376391550000',
      filled_size: '0.01291771',
      executed_value: '9.9750556620000000',
      status: 'done',
      settled: true,
    };
  });
