const request = require('./cb.request');
const sleep = require('../lib/sleep');

module.exports = async productID => {
  const response = await request({
    requestPath: `/products/${productID}`,
    method: 'GET',
  });
  await sleep(500); // prevent rate limiting at startup
  return response ? response.json : response;
};
