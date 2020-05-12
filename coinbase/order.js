// https://docs.pro.coinbase.com/?javascript#place-a-new-order

const { divide, multiply } = require("mathjs");
const memory = require("../data/memory");
const request = require("./cb.request");

module.exports = async (opts) => {
  if (process.env.CPBB_DRY_RUN) {
    console.log("dry run, fake", opts.side);
    const converted = multiply(Number(opts.funds), 0.998);
    return {
      filled_size: divide(converted, memory.price),
      settled: true,
    };
  }
  return request({
    requestPath: "/orders",
    method: "POST",
    body: opts,
  });
};
