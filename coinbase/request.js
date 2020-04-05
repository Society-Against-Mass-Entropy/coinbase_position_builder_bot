const config = require('../config')
const request = require('request')
const requestSign = require('./request.sign')
module.exports = (opts, cb) => {
  const timestamp = Date.now() / 1000;
  const requestConfig = {
    uri: config.api + opts.requestPath,
    json: true,
    method: opts.method,
    headers: {
      'CB-ACCESS-KEY': process.env.CPBB_APIKEY,
      'CB-ACCESS-SIGN': requestSign({
        timestamp: timestamp,
        requestPath: opts.requestPath,
        body: opts.body,
        method: opts.method
      }),
      'CB-ACCESS-PASSPHRASE': process.env.CPBB_APIPASS,
      'CB-ACCESS-TIMESTAMP': timestamp,
      'User-Agent': 'CBPP'
    }
  }
  if (opts.body) {
    requestConfig.body = opts.body
  }
  request(requestConfig, (err, res, body) => {
    if (err) console.error('', err)
    cb(err, body)
  })
}
