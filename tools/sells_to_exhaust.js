/**
 * model a future path in which all actions are sell
 * how long will it take to run down the supply of the currency
 * given the current holdings
 *
 * run like so:
 * CPBB_VOL=100 CPBB_APY=150 CPBB_TICKER=BTC CPBB_CURRENCY=USD node sells_to_exhaust.js
 */

process.env.CPBB_DRY_RUN = 'true';

// start by copying existing non-dry history to dry history

const fs = require('fs');
fs.copyFileSync(
  `${__dirname}/../data/history.${process.env.CPBB_TICKER}-${process.env.CPBB_CURRENCY}.tsv`,
  `${__dirname}/../data/history.${process.env.CPBB_TICKER}-${process.env.CPBB_CURRENCY}.dryrun.tsv`
);

const config = require('../config');
const memory = require('../lib/memory');
const { add, divide } = require('../lib/math');

const data = memory.lastLog;
const currentHolding = data.Holding + data.Shares;

const sellAt = add(divide(data.Target, currentHolding), config.vol).toFixed(2);

console.log(memory.lastLog, sellAt);

// pretend the price goes straight to the selling point and remains at that precise point
// of selling
