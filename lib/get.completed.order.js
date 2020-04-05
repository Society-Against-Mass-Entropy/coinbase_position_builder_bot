const getOrder = require('../coinbase/get.order')
const log = require('./log')
const {retry} = require('async')
module.exports = (data, callback) => {
  if (data.response.settled) {
    return callback(null, data) // immediate fill
  }
  // we need to call back to ask for the details
  retry({
    times: 60,
    interval: function(retryCount) {
      return 50 * Math.pow(2, retryCount);
    }
  }, cb => {
    log(`getting order details`, data.response.id)
    getOrder(data.response.id, (err, response) => {
      if(err){
        console.error(err, response)
        return cb(err)
      }
      if (!response.settled || response.message==='NotFound') {
        console.log('settlement delayed...trying again...')
        return cb(response)
      }
      return cb(null, {
        action: data.action,
        response: response
      })
    })
  }, callback)
}
