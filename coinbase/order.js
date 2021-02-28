// https://docs.pro.coinbase.com/?javascript#place-a-new-order

const { divide, multiply } = require("../lib/math");
const config = require("../config");
const memory = require("../lib/memory");
const numFix = require("../lib/number.fix");
const request = require("./cb.request");

module.exports = async opts => {
  if (config.dry) {
    // fake out a .5% fee subtraction (worst case tier)
    const converted = multiply(opts.funds, 0.995);
    return {
      executed_value: Number(opts.funds),
      filled_size: numFix(divide(converted, memory.price), 8),
      fill_fees: multiply(opts.funds, 0.005),
      settled: true,
    };
  }
  if (process.env.LOG_CORRECTION) {
    return {
      filled_size: process.env.LOG_CORRECTION,
      settled: true,
    };
  }
  const response = await request({
    requestPath: "/orders",
    method: "POST",
    body: opts,
  });
  return response ? response.json : response;
};
