const config = require('../config');
const request = require('./cb.request');
const sleep = require('../lib/sleep');

module.exports = async productID => {
  const response = await request({
    requestPath: `/products/${productID}`,
    method: 'GET',
  });
  await sleep(config.sleep.product); // prevent rate limiting at startup
  return response ? response.json : response;
};
