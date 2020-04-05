const request = require('./request')

module.exports = (id, cb) => {
  request({
    requestPath: `/orders/${id}`,
    method: 'GET'
  }, cb)
}
