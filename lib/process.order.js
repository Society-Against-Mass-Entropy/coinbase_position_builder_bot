const config = require('../config')
const order = require('../coinbase/order')
module.exports = (action, cb) => {
  // post market taker action
  order({
    type: 'market',
    side: action.funds > 0 ? 'buy' : 'sell',
    funds: Math.abs(action.funds) + '',
    product_id: config.productID
  }, (err, data) => {
    cb(err, {
      action: action,
      response: data
    })
  })
}
