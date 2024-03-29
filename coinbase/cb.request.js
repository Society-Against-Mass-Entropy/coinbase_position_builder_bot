const config = require('../config');
const log = require('../lib/log');
const request = require('./http.request');
const requestSign = require('./request.sign');
const { URL } = require('url');

const { hostname } = new URL(config.api);
/**
 * wrapper for http request specific to api header requirements
 */
module.exports = async opts => {
  const timestamp = Math.floor(Date.now() / 1000).toString();

  const body = opts.body ? JSON.stringify(opts.body) : '';

  const requestConfig = {
    port: 443,
    hostname,
    path: `${opts.requestPath}${opts.query || ''}`,
    method: opts.method,
    headers: {
      'CB-ACCESS-KEY': config.CPBB_APIKEY,
      'CB-ACCESS-SIGN': requestSign({
        timestamp,
        requestPath: opts.requestPath,
        body: body,
        method: opts.method,
      }),
      'CB-ACCESS-TIMESTAMP': timestamp,
    },
  };
  if (body) {
    requestConfig.body = body;
    requestConfig.headers['Content-Length'] = body.length;
    requestConfig.headers['Content-Type'] = 'application/json';
  }

  return request(requestConfig).catch(({ reason, json, res }) => {
    if (res && res.statusCode !== 404)
      log.error(opts.method, opts.requestPath, reason, json || '');
    return { reason, json, res };
  });
};
