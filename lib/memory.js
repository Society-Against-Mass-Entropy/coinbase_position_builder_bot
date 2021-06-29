// shared application memory module
const history = require('./history');

const config = require('../config');
const makerOrders = require(config.maker_file);
module.exports = {
  account: {},
  firstLog: history.first(),
  lastLog: history.last(),
  makerOrders: makerOrders.orders || makerOrders,
};
