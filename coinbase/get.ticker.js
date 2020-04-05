const request = require('./request')
const config = require('../config')
const memory = require('../data/memory')

module.exports = cb => {
  request({
    requestPath: `/products/${config.productID}/ticker`,
    method: 'GET'
  }, (err, data)=>{
    memory.price = Number(data.price)
    cb(err, data)
  })
}
