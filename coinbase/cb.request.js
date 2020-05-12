const config = require("../config");
const request = require("./http.request");
const requestSign = require("./request.sign");
/**
 * wrapper for http request specific to coinbase pro header requirements
 */
module.exports = async (opts) => {
  const timestamp = Date.now() / 1000;
  const requestConfig = {
    uri: config.api + opts.requestPath,
    json: true,
    method: opts.method,
    headers: {
      "CB-ACCESS-KEY": process.env.CPBB_APIKEY,
      "CB-ACCESS-SIGN": requestSign({
        timestamp,
        requestPath: opts.requestPath,
        body: opts.body,
        method: opts.method,
      }),
      "CB-ACCESS-PASSPHRASE": process.env.CPBB_APIPASS,
      "CB-ACCESS-TIMESTAMP": timestamp,
      "User-Agent": "CBPP",
    },
  };
  if (opts.body) {
    requestConfig.body = opts.body;
  }
  return request(requestConfig);
};
