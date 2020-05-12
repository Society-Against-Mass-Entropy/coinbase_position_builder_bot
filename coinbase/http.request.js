const http = require("https");
module.exports = (params, postData) => {
  return new Promise(function (resolve, reject) {
    const req = http.request(params, function (res) {
      if (res.statusCode < 200 || res.statusCode >= 300) {
        return reject(new Error("statusCode=" + res.statusCode));
      }
      const body = [];
      res.on("data", function (chunk) {
        body.push(chunk);
      });
      res.on("end", function () {
        try {
          resolve(JSON.parse(Buffer.concat(body).toString()));
        } catch (e) {
          reject(e);
        }
      });
    });
    // reject on request error
    req.on("error", function (err) {
      // This is not a "Second reject", just a different sort of failure
      reject(err);
    });
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
};
