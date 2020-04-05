const request = require('./request')

module.exports = (cb) => {
  request({
    requestPath: '/accounts',
    method: 'GET'
  }, cb)
}
