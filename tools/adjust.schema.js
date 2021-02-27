/**
 * just a tool for me to update the log schema or tweak the calculated values
 * if new rules take effect
 */
console.log(`🤖 Position Builder Engine Updater`);

const fs = require("fs");
const history = require("../lib/history");
const { divide, subtract, multiply, add, pow } = require("../lib/math");
const map = require("lodash.map");
const MS_PER_YEAR = 31556952000;

const all = history.all();

console.log(all[0].Time, all[all.length - 1].Time);

const start = new Date(all[0].Time).getTime();

for (let i = 0; i < all.length; i++) {
  // fix holding (format 8 decimals)
  // all[i].Holding = !i ? 0 : add(all[i-1].Holding, all[i-1].Shares).toFixed(8)

  all[i].InProfit = !i
    ? 0
    : multiply(
      subtract(divide(all[i].Value, all[i - 1].TotalInput), 1),
      100
    ).toFixed(2) + "%";

  // add elapsed ms
  all[i].Elapsed = !i ? 0 : new Date(all[i].Time).getTime() - start;
  // add invested gain (raw profit from invested amount--before we take action)
  all[i].Gain = !i ? 0 : subtract(all[i].Value, all[i - 1].TotalInput);
  // the rate of return so far for all invested funds
  all[i].RealPeriodRate = !i ? 0 : divide(all[i].Gain, all[i - 1].TotalInput);
  // annual rate is (((PeriodRate+1)^(ms_in_period/MS_PER_YEAR))-1)*100+'%'
  all[i].PeriodsPerYear = !i ? 0 : divide(MS_PER_YEAR, all[i].Elapsed);
  all[i].InAPY = !i
    ? 0
    :
    multiply(
      subtract(
        pow(add(all[i].RealPeriodRate, 1), all[i].PeriodsPerYear),
        1
      ),
      100
    ).toFixed(2) + "%";

  // console.log(all[i])
  // if(i) console.log(all[i-1].Holding, '+',all[i-1].Shares, '=',all[i].Holding)
}

const data = [
  `${history.headerRow}\tInProfit\tElapsed\tGain\tRealPeriodRate\tPeriodsPerYear\tInAPY`,
  ...all.map((row) => map(row, (v) => v).join("\t")),
].join("\n");

fs.writeFileSync(`${__dirname}/../data/history.BTC-USD.fixed.tsv`, data);
