const request = require('./cb.request');
// const log = require('../lib/log');
module.exports = async () => {
  const response = await request({
    requestPath: '/accounts',
    method: 'GET',
  });
  // log.debug(json);
  return response ? response.json : response;
};
