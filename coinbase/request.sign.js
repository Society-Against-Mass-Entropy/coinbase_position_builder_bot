const crypto = require('crypto');
const config = require('../config');
// const log = require("../lib/log");
// https://docs.cloud.coinbase.com/advanced-trade-api/docs/rest-api-auth
module.exports = opts => {
  // create the prehash string by concatenating required parts
  const what = opts.timestamp + opts.method + opts.requestPath + opts.body;
  // decode the base64 secret
  const key = Buffer.from(config.CPBB_APISEC, 'base64');
  // create a sha256 hmac with the secret
  const hmac = crypto.createHmac('sha256', key);
  // sign the require message with the hmac
  // and finally base64 encode the result
  const signature = hmac.update(what).digest('base64');
  // log.debug(`signature`, what, signature);
  return signature;
};
