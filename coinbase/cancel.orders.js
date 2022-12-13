// https://docs.cloud.coinbase.com/advanced-trade-api/reference/retailbrokerageapi_cancelorders

const config = require('../config');
const request = require('./cb.request');

module.exports = async ids => {
  if (config.dry) return true;
  const result = await request({
    requestPath: `/orders/batch_cancel`,
    method: 'POST',
    body: ids, // array of strings
  });

  return result ? result.json : false;
};
