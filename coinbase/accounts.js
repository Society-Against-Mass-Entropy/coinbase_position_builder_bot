const request = require("./cb.request");

module.exports = async () =>
  request({
    requestPath: "/accounts",
    method: "GET",
  });
