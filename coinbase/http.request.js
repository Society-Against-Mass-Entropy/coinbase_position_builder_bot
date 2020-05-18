const http = require("https");
const log = require("../lib/log");
module.exports = (params) => {
  const makeRequest = function (resolve, reject) {
    // console.log({ params });
    const req = http.request(params, function (res) {
      const body = [];
      res.on("data", function (chunk) {
        body.push(chunk);
      });
      res.on("end", function () {
        const responseBody = Buffer.concat(body).toString();
        let json;
        try {
          json = JSON.parse(responseBody);
        } catch (e) {
          reject(e);
        }
        if (res.statusCode < 200 || res.statusCode >= 300) {
          if (json && json.message === "invalid signature") {
            log.error(
              "invalid signature. Check your CPBB_APIKEY, CPBB_APISEC, CPBB_APIPASS settings!"
            );
            process.exit();
          }
          return reject(res.statusCode);
        }
        resolve(json);
      });
    });
    // reject on request error
    req.on("error", function (err) {
      // This is not a "Second reject", just a different sort of failure
      reject(err);
    });
    if (params.body) {
      // log.info(`write body`, params.body);
      req.write(params.body);
    }
    req.end();
  };
  return new Promise(makeRequest);
};
