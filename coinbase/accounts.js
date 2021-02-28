const request = require('./cb.request');
// const log = require('../lib/log');
module.exports = async () => {
  const { json } = await request({
    requestPath: '/accounts',
    method: 'GET',
  });
  // log.debug(json);
  return json;
};
