const memory = require('./memory');
const { add, divide, subtract, multiply, pow } = require('./math');
// const log = require('./log');
/**
 * period to APY in spreadsheet:
 * =((((P5/100)+1)^(1/(DAYS(TODAY()+1, SUM(SPLIT($A$3, "T")))/365)))-1)*100

 * Effective Yield = ((1+r/n)^n - 1) * 100, where r is the period rate and n is the periods per year (365 for days)
 * Periods to APY = (((periodRate / 100) + 1)^(1/days/365) - 1) * 100
 */
module.exports = ({ endValue, totalInput, dateNow }) => {
  if (!endValue || !totalInput) return 0;
  // profit percentage without considering realized gains
  // the sell engine will only sell if held value calculates above APY (not captured gains)

  // considering the entire time of our investment the investment period
  const periodRate = subtract(divide(endValue, totalInput), 1);

  const startTime = new Date(memory.firstLog.Time).getTime();
  const endTime = dateNow.getTime();
  const elapsed = endTime - startTime;
  // ms per year over elapsed ms (the full investment period)
  // const periodsPerYear = divide(31536000000, elapsed);

  // log.debug(
  //   { endValue, totalInput, periodRate, elapsed, periodsPerYear },
  //   dateNow.toISOString(),
  //   memory.firstLog.Time
  // );
  return multiply(
    subtract(
      pow(add(1, divide(periodRate, 100)), 1 / (elapsed / 31536000000)),
      1
    ),
    100
  );
};
