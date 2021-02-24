/**
 * Handles rebuying after a sell by setting up limit orders on the books using special config vars
 * Sample env config:
// should the engine only create and manage the limit orders and not make normal accumulation trades
// useful for testing this feature
CPBB_REBUY_ONLY: false,
// maximum dollar value consumed by limit order placements
CPBB_REBUY_MAX: 50,
// rebuy logic will place up to  orders at this size until CPBB_REBUY_MAX is reached
CPBB_REBUY_SIZE: ".0001,.0001,.0002,.0002,.0003,.0003,.0004,.0004,.0005,.0005",
// rebuy at these percentage drop targets(-4%, etc)
// note: you have to define at least the number of points in CPBB_REBUY_SIZE
CPBB_REBUY_AT: "-4,-6,-8,-10,-12,-15,-20,-25,-50,-80",
 */
const { add, divide, format, multiply } = require('mathjs');
const config = require('../config');
const fs = require('fs');
const log = require("./log");
const memory = require("./memory");
const processOrder = require('./process.order');
module.exports = async (basePrice) => {
  // starting percentage down from basePrice to place limit orders
  const dropPoints = process.env.CPBB_REBUY_AT.split(',').map(p => divide(Number(p), 100));
  // only set orders until they reach this threshold total
  const maxFunds = Number(process.env.CPBB_REBUY_MAX);
  const sizes = process.env.CPBB_REBUY_SIZE.split(',').map(s => Number(s));
  let usedFunds = 0;
  for (let i = 0; i < sizes.length; i++) {
    let percentageDrop = dropPoints[i];
    let size = sizes[i];
    let price = add(basePrice, multiply(basePrice, percentageDrop)).toFixed(2);
    let funds = format(multiply(size, price), { notation: 'fixed', precision: 4 });
    if (add(usedFunds, funds) > maxFunds) {
      break; // stop processing
    }
    usedFunds = add(usedFunds, funds);
    let order = {
      funds,
      price,
      size,
      type: 'limit',
    };
    let orderResponse = await processOrder(order);
    log.debug({ order, orderResponse });
    log.now(`⬇️  posted limit order for ${size} ${config.ticker} @ ${price} = $${funds} (${percentageDrop * 100}% drop)`);
    memory.makerOrders.orders.push({
      pair: config.productID,
      funds,
      id: orderResponse.id,
      price,
      size
    });
  }
  log.debug(`REBUY: set ${memory.makerOrders.orders.length} limit orders totalling $${usedFunds}`);
  // save makerOrders to disk in case this process crashes
  fs.writeFileSync(config.maker_file, JSON.stringify(memory.makerOrders, null, 2));
}
