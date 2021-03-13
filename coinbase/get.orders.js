const log = require('../lib/log');
const request = require('./cb.request');
module.exports = async () => {
  const opts = {
    requestPath: `/orders`,
    method: 'GET',
  };
  log.debug(opts);
  const response = await request(opts);
  return response ? response.json : response;
};
