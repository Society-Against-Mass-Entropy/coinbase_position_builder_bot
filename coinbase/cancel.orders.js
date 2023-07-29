// https://docs.cloud.coinbase.com/advanced-trade-api/reference/retailbrokerageapi_cancelorders

const config = require('../config');
const request = require('./cb.request');

module.exports = async ids => {
  if (config.dry) return true;
  const result = await request({
    requestPath: `/api/v3/brokerage/orders/batch_cancel`,
    method: 'POST',
    body: { order_ids: ids }, // array of strings
  });

  return result ? result.json.results : false;
};
