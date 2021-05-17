const request = require('./cb.request');
// const log = require('../lib/log');
module.exports = async () => {
  const result = await request({
    requestPath: '/accounts',
    method: 'GET',
  });
  // log.debug(json);
  return result ? result.json : result;
};
