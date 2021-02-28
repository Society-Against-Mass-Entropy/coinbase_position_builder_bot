/**
 * parses a history file to get the FIFO-based profit/loss report for a given year
 * run with:
 *
 * cd tools;
 * CPBB_TICKER=BTC CPBB_CURRENCY=USD CPBB_YEAR=2020 node tax_fifo.js
 */

const history = require('../lib/history');
const log = require('../lib/log');
const { add, divide, multiply, subtract } = require('../lib/math');
const year = Number(process.env.CPBB_YEAR);
log.bot(`Position Builder Bot FIFO Calculator ${year}`);

const dollarize = val => `$${val.toFixed(2)}`;
const all = history
  .all()
  // only need to examine up to the end of the year we are calculating
  .filter(txn => new Date(txn.Time).getFullYear() <= year)
  // only care about time, funds, shares traded
  .map(txn => ({
    time: new Date(txn.Time),
    funds: txn.Funds,
    basis: divide(txn.Funds, txn.Shares),
    shares: txn.Shares,
  }));

const buys = all.filter(txn => txn.funds > 0);
const sells = all.filter(txn => txn.funds < 0);

log.ok(
  `found ${all.length} transactions (${buys.length} buys, and ${sells.length} sells) leading up to the end of ${year}`
);

let shortTermBasis = 0;
let shortTermProceeds = 0;
let shortTermGain = 0;
let shortTermFees = 0;

let longTermBasis = 0;
let longTermProceeds = 0;
let longTermGain = 0;
let longTermFees = 0;

let buyIndex = 0;

sells.forEach(sell => {
  log.zap(
    `finding match for sell on ${sell.time} ${sell.funds} ${sell.shares}`
  );
  // if (idx === 5) process.exit();
  const sellYear = sell.time.getFullYear();
  for (let i = buyIndex, len = buys.length; i < len; i++) {
    let buy = buys[i];
    if (!buy.shares) {
      log.ok(`buy at ${i} used up`, { buy });
      buyIndex = i + 1; // prevent the next sell from looking earlier than this
      continue; // already sold this set
    }
    let ms = subtract(sell.time.getTime(), buy.time.getTime());
    let isLongTerm = ms > 31556952000; // greater than 1 year since buy
    // how much of the sell can we consider from this buy
    let posSellShares = multiply(-1, sell.shares);
    let closedShares = posSellShares < buy.shares ? posSellShares : buy.shares;
    log.debug(
      `closedShares: ${closedShares} from ${sell.shares} sold matched to ${buy.shares} buy`
    );
    // subtract sold shares from the buy stack
    buy.shares = subtract(buy.shares, closedShares);
    // add sold shares to nullify them from the sell stack
    sell.shares = add(sell.shares, closedShares);
    let closedSellValue = multiply(closedShares, sell.basis);
    let closedBuyValue = multiply(closedShares, buy.basis);
    let profit = subtract(closedSellValue, closedBuyValue);
    log.ok(
      `sold ${closedShares} shares @ ${dollarize(sell.basis)} for ${dollarize(
        closedSellValue
      )}, bought @ ${dollarize(buy.basis)} for ${dollarize(
        closedBuyValue
      )} | net ${dollarize(profit)} in ${
        isLongTerm ? 'long' : 'short'
      }-term gains`
    );
    // NOTE: we want to calculate buys/sells since the beginning of time
    // but only sells that happen in the year are counted for output
    if (sellYear === year) {
      if (isLongTerm) {
        longTermGain = add(longTermGain, profit);
        longTermBasis = add(longTermBasis, closedBuyValue);
        longTermProceeds = add(longTermProceeds, closedSellValue);
      } else {
        shortTermGain = add(shortTermGain, profit);
        shortTermBasis = add(shortTermBasis, closedBuyValue);
        shortTermProceeds = add(shortTermProceeds, closedSellValue);
      }
    }
    if (buy.shares > 0) log.debug(`${buy.shares} remaining @ ${buy.basis}`);
    if (sell.shares > 0)
      log.error('something very wrong with this algorithm', { sell });
    if (!sell.shares) return; // break the loop and kill this function (onto the next sell)
  }
});

log.ok(`\nshort-term basis: ${dollarize(shortTermBasis)}`);
log.ok(`short-term proceeds: ${dollarize(shortTermProceeds)}`);
log.ok(`short-term gains: ${dollarize(shortTermGain)}`);
log.ok(`short-term fees: ${dollarize(shortTermFees)}`);
log.ok(`\nlong-term basis: ${dollarize(longTermBasis)}`);
log.ok(`long-term proceeds: ${dollarize(longTermProceeds)}`);
log.ok(`long-term gains: ${dollarize(longTermGain)}`);
log.ok(`long-term fees: ${dollarize(longTermFees)}`);
