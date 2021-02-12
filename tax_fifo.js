/**
 * parses a history file to get the FIFO-based profit/loss report for a given year
 * run with
 *
 * CPBB_TICKER=BTC CPBB_CURRENCY=USD CPBB_YEAR=2020 node tax_fifo.js
 */

const history = require("./lib/history");
const { add, bignumber, number, divide, format, multiply, subtract } = require("mathjs");
const year = process.env.CPBB_YEAR;
console.log(`🤖 Position Builder Bot FIFO Calculator ${year}`);

const dollarize = val => format(val, { notation: 'fixed', precision: 2 });
const all = history.all()
  // only need to examine up to the end of the year we are calculating
  .filter(txn => new Date(txn.Time).getFullYear() <= year)
  // only care about time, funds, shares traded
  .map(txn => ({
    time: new Date(txn.Time),
    funds: txn.Funds,
    basis: divide(txn.Funds, bignumber(txn.Shares)),
    shares: bignumber(txn.Shares)
  }));

const buys = all.filter(txn => txn.funds > 0);
const sells = all.filter(txn => txn.funds < 0);

console.log(`found ${all.length} transactions (${buys.length} buys, and ${sells.length} sells) leading up to the end of ${year}`)

let shortTermGain = 0;
let longTermGain = 0;
let buyIndex = 0;

sells.forEach((sell, idx) => {
  // console.log(`finding match for sell on ${sell.time} ${sell.funds} ${sell.shares}`);
  // if (idx === 5) process.exit();
  const sellYear = sell.time.getFullYear();
  for (let i = buyIndex, len = buys.length; i < len; i++) {
    let buy = buys[i];
    if (!number(buy.shares)) {
      // console.log(`buy at ${i} used up`, { buy });
      buyIndex = i + 1; // prevent the next sell from looking earlier than this
      continue; // already sold this set
    }
    let ms = subtract(sell.time.getTime(), buy.time.getTime())
    let isLongTerm = ms > 31556952000; // greater than 1 year since buy
    // how much of the sell can we consider from this buy
    let posSellShares = multiply(-1, sell.shares);
    let closedShares = posSellShares < buy.shares ? posSellShares : buy.shares;
    // console.log(`closedShares: ${number(closedShares)} from ${number(sell.shares)} sold matched to ${number(buy.shares)} buy`)
    // subtract sold shares from the buy stack
    buy.shares = subtract(buy.shares, closedShares);
    // add sold shares to nullify them from the sell stack
    sell.shares = add(sell.shares, closedShares);
    let closedSellValue = multiply(closedShares, sell.basis);
    let closedBuyValue = multiply(closedShares, buy.basis);
    let profit = subtract(closedSellValue, closedBuyValue);
    console.log(`sold ${number(closedShares)} shares @ $${dollarize(sell.basis)} for $${dollarize(closedSellValue)}, bought @ $${dollarize(buy.basis)} for $${dollarize(closedBuyValue)} | net ${dollarize(profit)} in ${isLongTerm ? 'long' : 'short'}-term gains`);
    // NOTE: we want to calculate buys/sells since the beginning of time
    // but only sells that happen in the year are counted for output
    if (sellYear === number(year)) {
      if (isLongTerm) longTermGain = add(longTermGain, profit);
      else shortTermGain = add(shortTermGain, profit);
    }
    // if (number(buy.shares) > 0) console.log(`${number(buy.shares)} remaining @ ${number(buy.basis)}`)
    if (number(sell.shares) > 0) console.error('something very wrong with this algorithm', { sell });
    if (!number(sell.shares)) return; // break the loop and kill this function (onto the next sell)
  }
});

console.log(`short-term gains: $${dollarize(shortTermGain)}`);
console.log(`long-term gains: $${dollarize(longTermGain)}`);
