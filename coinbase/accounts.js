const request = require('./cb.request');
// const log = require('../lib/log');
module.exports = async () => {
  const result = await request({
    requestPath: '/api/v3/brokerage/accounts',
    query: '?limit=250',
    method: 'GET',
  });
  return result?.json?.accounts;
};
