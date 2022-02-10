const { multiply, divide, precision, subtract } = require('./math');

/**
 * calculate a dynamic API within a range, using a parabolic decay
 * e.g. getting a dynamic APY that scales from 200% at $0 to 10% at $1M price
 * in the calculations, we treat this like a 90 degree parabolic rate
 * where X is the price and Y is the APY
 */

let dynamic;
let dynamicStart;
let dynamicEnd;
let minAPY;
let maxAPY;
let minPrice;
let maxPrice;
if (process.env.CPBB_APY_DYNAMIC) {
  // e.g. CPBB_APY_DYNAMIC=200@5000-10@1000000
  dynamic = process.env.CPBB_APY_DYNAMIC.split('-');
  dynamicStart = dynamic[0].split('@');
  dynamicEnd = dynamic[1].split('@');
  minAPY = dynamicEnd[0];
  maxAPY = dynamicStart[0];
  minPrice = Number(dynamicStart[1]);
  maxPrice = Number(dynamicEnd[1]);
}

const config = require('../config');
module.exports = price => {
  if (!dynamic) return config.apy;
  if (price <= minPrice) return divide(maxAPY, 100);
  if (price >= maxPrice) return divide(minAPY, 100);
  // 200->10 = traversable range of 190
  const apyRange = subtract(maxAPY, minAPY);
  // if minPrice is 10K, we start at 0 progress through APY decay at 10K
  const priceShift = subtract(price, minPrice);
  // at price = 500000 with maxPrice of 1M, percentageComplete is 50%
  const percentageComplete = divide(priceShift, maxPrice);
  // we give it a parabolic weighting with a higher starting velocity
  // (1%->10%, 9%->30%, 25%->50%, 64%->80%)
  const plotFn = Math.sqrt(percentageComplete);
  const apyComplete = multiply(apyRange, plotFn);
  // the rate starts at the maxAPY and decays to minAPY, so we have to invert it
  const apy = subtract(maxAPY, apyComplete);
  // and finally, the apy is expressed in int terms (18% rather than the multiple we use: .18)
  return precision(divide(apy, 100), 4);
};
