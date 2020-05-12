const moment = require("moment");
const Table = require("cli-table3");
module.exports = (headers, rows) => {
  var table = new Table({
    head: headers,
    colWidths: [
      process.env.CPBB_DRY_RUN ? 7 : 4, // icon
      27, // Time
      12, // Price
      16, // Holding
      15, // Value
      8, // Funds
      12, // Shares
      12, // PeriodRate
      14, // ExpectedGain
      12, // TotalInput
      12, // Target
      12, // Diff
      12, // EndValue
      12, // Realized
      12, // TotalValue
      12, // Liquid
      12, // Profit
    ],
  });
  // table is an Array, so you can `push`, `unshift`, `splice` and friends
  table.push(
    ...(rows || []).map((r) => {
      if (r.length > 1) {
        // logs are saved in UTC, but we want to render localtime in the terminal
        r[1] = moment(r[1]).format();
      }
      return r;
    })
  );
  console.log(table.toString());
};
