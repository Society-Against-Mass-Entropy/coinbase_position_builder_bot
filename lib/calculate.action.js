// there are ~31556952000 milliseconds per gregorian year, so each millisecond
// since the last log timestamp accounts for an expected growth rate of 1/31556952000 of the APY
const MS_PER_YEAR = 31556952000;
const config = require("../config");
const { add, divide, multiply, subtract, pow } = require("./math");
const memory = require("./memory");
module.exports = async ({ dateOverride, forceBuy, price, type, volOverride }) => {
  const vol = volOverride || config.vol; // we override volume with the rebuy option
  const action = {
    type: type || 'market'
  };
  action.dateNow = dateOverride || new Date();
  action.dateLast = memory.lastLog.Time
    ? new Date(memory.lastLog.Time)
    : action.dateNow;
  action.msPassed = action.dateNow - action.dateLast; // milliseconds delta
  action.price = price;
  action.currentHolding = add(memory.lastLog.Holding, memory.lastLog.Shares);
  // we get the period rate for the APY by taking the APY (e.g. 10% as 1.10) and raising it to the power
  // of the delta in time, then subtract 1 to get the change multiplier
  action.periodRate = subtract(pow(1 + config.apy, divide(1, divide(MS_PER_YEAR, action.msPassed))), 1);
  action.expectedGain = multiply(memory.lastLog.Target, action.periodRate);
  // liquid value of our holdings in the target ticker
  action.value = multiply(action.currentHolding, action.price);
  // make sure our target can handle selling the vol
  // we want our position to grow by the expected gain + our vol target + the last target (accumulates APY expectation)
  action.target = add(add(vol, action.expectedGain), memory.lastLog.Target);
  if (memory.lastLog.Funds < 0) {
    // however, if we sold on the last action, that vol shouldn't add to our growth target
    action.target = add(action.target, memory.lastLog.Funds);
  }
  action.diff = subtract(action.value, action.target);
  // simply, if our account value is above the target, sell, else buy
  // the `funds` is our market buy/sell amount in the base currency
  const tradeValue = vol;
  // in the case of a limit order that was filled, we are forcing the calculation to have already bought (can't calc a sell)
  action.funds = forceBuy ? tradeValue : (action.diff > 0 ? tradeValue * -1 : tradeValue);
  action.endValue = add(action.value, action.funds);
  action.realized = add(
    memory.lastLog.Realized,
    action.funds > 0 ? 0 : action.funds * -1
  );
  // total input does not subtract when we take profit (that's realized profit)
  action.totalInput = add(
    memory.lastLog.TotalInput,
    action.funds > 0 ? action.funds : 0
  );
  action.totalValue = add(action.endValue, action.realized);
  action.liquidValue = subtract(action.totalValue, action.totalInput);
  return action;
};
