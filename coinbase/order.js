// https://docs.pro.coinbase.com/?javascript#place-a-new-order

const {divide, multiply} = require('mathjs')
const memory = require('../data/memory')
const request = require('./request')

module.exports = (opts, cb) => {
  if (process.env.CPBB_DRY_RUN) {
    console.log('dry run, fake', opts.side)
    const converted = multiply(Number(opts.funds), .998)
    return cb(null, {
      filled_size: divide(converted, memory.price),
      settled: true
    })
  }
  request({
    requestPath: '/orders',
    method: 'POST',
    body: opts
  }, cb)
}
