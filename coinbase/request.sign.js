const crypto = require("crypto");
// https://docs.pro.coinbase.com/?javascript#signing-a-message
module.exports = (opts) => {
  // create the prehash string by concatenating required parts
  const what =
    opts.timestamp +
    opts.method +
    opts.requestPath +
    (opts.body ? JSON.stringify(opts.body) : "");
  // decode the base64 secret
  const key = Buffer.from(process.env.CPBB_APISEC, "base64");
  // create a sha256 hmac with the secret
  const hmac = crypto.createHmac("sha256", key);
  // sign the require message with the hmac
  // and finally base64 encode the result
  const signature = hmac.update(what).digest("base64");
  // console.log(what)
  // console.log(signature)
  return signature;
};
