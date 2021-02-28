// shared application memory module
const history = require("./history");

const config = require("../config");

module.exports = {
  account: {},
  firstLog: history.first(),
  lastLog: history.last(),
  makerOrders: require(config.maker_file),
};
