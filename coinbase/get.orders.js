const config = require('../config');
const log = require('../lib/log');
const request = require('./cb.request');
module.exports = async ({ status }) => {
  const opts = {
    requestPath:
      `/orders?product_id=${config.productID}` +
      (status ? `&status=${status}` : ''),
    method: 'GET',
  };
  log.debug(opts);
  const response = await request(opts);
  return response ? response.json : response;
};
