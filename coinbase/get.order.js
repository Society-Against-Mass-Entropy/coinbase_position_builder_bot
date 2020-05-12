const request = require("./cb.request");

module.exports = async (id) =>
  request({
    requestPath: `/orders/${id}`,
    method: "GET",
  });
