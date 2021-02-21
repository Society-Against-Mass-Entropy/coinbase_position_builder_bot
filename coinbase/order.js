// https://docs.pro.coinbase.com/?javascript#place-a-new-order

const { divide, multiply } = require("mathjs");
const memory = require("../data/memory");
const numFix = require("../lib/number.fix");
const request = require("./cb.request");

module.exports = async (opts) => {
  if (process.env.CPBB_DRY_RUN) {
    // fake out a .002 fee subtraction
    const converted = multiply(Number(opts.funds), 0.998);
    return {
      filled_size: numFix(divide(converted, memory.price), 8),
      settled: true,
    };
  }
  if (process.env.LOG_CORRECTION) {
    return {
      filled_size: process.env.LOG_CORRECTION,
      settled: true,
    };
  }
  return request({
    requestPath: "/orders",
    method: "POST",
    body: opts,
  });
};
