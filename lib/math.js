/**
- Mathjs needed to be altered to fix floating point rounding issues with javascript numbers
  - math.add(0.12460097, '0.12035164') => 0.24495261000000002
  - math.number((math.add(0.12460097, math.bignumber('0.12035164')))) => 0.24495261
  - now we have a small helper module that uses mathjs to automatically convert to bignumber()
  and back into a normal javascript Number (without rounding error).
 */
const {
  add,
  bignumber,
  divide,
  multiply,
  number,
  pow,
  subtract,
} = require('mathjs');

const precision = (n, p) => number(bignumber(n).toFixed(p || 8));
const calc = (method, a, b, p) => {
  const r = number(method(bignumber(a), bignumber(b)));
  return p ? precision(r, p) : r;
};

module.exports = {
  add: (a, b, p) => calc(add, a, b, p),
  divide: (a, b, p) => calc(divide, a, b, p),
  multiply: (a, b, p) => calc(multiply, a, b, p),
  pow: (a, b, p) => calc(pow, a, b, p),
  precision,
  subtract: (a, b, p) => calc(subtract, a, b, p),
};
