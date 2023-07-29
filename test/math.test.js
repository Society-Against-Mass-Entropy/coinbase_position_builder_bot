/**
 * ensure math interface is without JS float precision errors
 */
const { add, subtract, divide, multiply, pow, random } = require('../lib/math');

test('add number and string: no rounding error', () => {
  // rounding error would produce 0.24495261000000002
  expect(add(0.12460097, '0.12035164')).toBe(0.24495261);
});
test('subtract number and string: no rounding error', () => {
  // if rounding error, would see 0.12460097 - 0.12035164 => 0.0042493300000000095
  expect(subtract(0.12460097, '0.12035164')).toBe(0.00424933);
});
test('multiply number and string: no rounding error', () => {
  // if rounding error, would see 3.1 * 2.1 => 6.510000000000001
  expect(multiply(3.1, '2.1')).toBe(6.51);
});
test('divide number and string: no rounding error', () => {
  // if rounding error, would see 1.0051 / 100 => 0.010051000000000001
  expect(divide(1.0051, '100')).toBe(0.010051);
});
test('pow number and string: no rounding error', () => {
  // if rounding error, would see Math.pow(3.1, 2) => 9.610000000000001
  expect(pow(3.1, '2')).toBe(9.61);
});
test('precision subtraction to 4 digits: no rounding error', () => {
  // if rounding error, would see 0.12460097 - 0.12035164 => 0.0042493300000000095
  expect(subtract(0.12460097, '0.12035164', 4)).toBe(0.0042);
});
test('random gives random number between range', () => {
  expect(random(0, 10000)).toBeLessThan(11000);
});
