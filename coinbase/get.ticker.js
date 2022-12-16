const request = require('./cb.request');
const config = require('../config');

module.exports = async () => {
  const result = await request({
    requestPath: `/api/v3/brokerage/products/${config.productID}/ticker`,
    method: 'GET',
  }).catch(e => {
    console.error(
      e,
      `failed to get ticker info for ${config.productID}. Please make sure this ticker exists.`
    );
    process.exit();
  });
  return result ? result.json : result;
};
