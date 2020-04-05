const calculateAction = require('./calculate.action')
const getCompletedOrder = require('./get.completed.order')
const getTicker = require('../coinbase/get.ticker')
const processOrder = require('./process.order')
const saveLog = require('./log.save')
const {waterfall} = require('async')

module.exports = () => {
  waterfall([
    getTicker,
    calculateAction,
    processOrder,
    getCompletedOrder,
    saveLog
  ], (err) => {
    if (err) return console.error(err)
  })
}
