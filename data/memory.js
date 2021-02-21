// shared application memory module
const history = require('../lib/history')
// load up any maker orders from a previous process launch
const makerOrders = require('./maker.orders.json')

module.exports = {
  account: {},
  firstLog: history.first(),
  lastLog: history.last(),
  makerOrders
}
