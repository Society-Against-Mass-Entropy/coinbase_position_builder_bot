// shared application memory module
const history = require('../lib/history')

module.exports = {
  account: {},
  firstLog: history.first(),
  lastLog: history.last()
}
