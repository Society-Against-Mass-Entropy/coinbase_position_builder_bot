/**
- Mathjs needed to be altered to fix floating point rounding issues with javascript numbers
  - math.add(0.12460097, '0.12035164') => 0.24495261000000002
  - math.number((math.add(0.12460097, math.bignumber('0.12035164')))) => 0.24495261
  - now we have a small helper module that uses mathjs to automatically convert to bignumber() and back into a normal javascript Number (without rounding error).
 */
const { number, bignumber, add, subtract, multiply, divide } = require('mathjs');

// vanilla JS (holding for posterity)
// const precision = 10000000000;
// const toInt = (v) => {
//   return Number(v) * precision;
// }
// const toFloat = (v) => {
//   return v / precision;
// }
// add: (a, b) => toFloat(toInt(a) + toInt(b)),

module.exports = {
  add: (a, b) => number(add(bignumber(a), bignumber(b))),
  subtract: (a, b) => number(subtract(bignumber(a), bignumber(b))),
  multiply: (a, b) => number(multiply(bignumber(a), bignumber(b))),
  divide: (a, b) => number(divide(bignumber(a), bignumber(b)))
}
