/**
 * Handles rebuying after a sell by setting up limit orders on the books using special config vars
 * Sample env config:
// should the engine only create and manage the limit orders and not make normal accumulation trades
// useful for testing this feature
CPBB_REBUY_ONLY: false,
// place up to 2 maker limit orders on the books after a sell action
CPBB_REBUY_MAX: 2,
// maximum dollar value consumed by limit order placements
CPBB_REBUY_VOL: 50,
// minimum order is in BTC (.0001, which is $5 at $50K, or $2 at $20K)
// rebuy logic will place up to CPBB_REBUY_MAX orders at this size until CPBB_REBUY_VOL is reached
CPBB_REBUY_SIZE: .0001,
// should the size be doubled at each percentage drop (.e.g .0001, .0002)?
// acts as a multiplier if you want to just go to .00015 with 1.5
CPBB_REBUY_MULTIPLIER: 2,
// -0.5% intervals (e.g. -0.05%, -0.01%, -0.15%, -0.2%, -0.25%, -0.3%, -0.35%, -0.4%)
CPBB_REBUY_AT: -0.05,
 */
const { add, divide, multiply } = require('mathjs');
const config = require('../config');
const fs = require('fs');
const log = require("./log");
const memory = require("../data/memory");
const processOrder = require('./process.order');
module.exports = async (basePrice) => {
  // starting percentage down from basePrice to place limit orders
  const baseDrop = divide(Number(process.env.CPBB_REBUY_AT), 100);
  // only set orders until they reach this threshold total
  const maxFunds = Number(process.env.CPBB_REBUY_VOL);
  let size = Number(process.env.CPBB_REBUY_SIZE);
  const multiplier = Number(process.env.CPBB_REBUY_MULTIPLIER);
  let usedFunds = 0; // counter
  log.debug(
    `REBUY: setting up to ${process.env.CPBB_REBUY_MAX} limit orders, up to $${maxFunds}, for ${size}${multiplier?` (x${multiplier})`:''} ${config.ticker} @ ${process.env.CPBB_REBUY_AT}% drops`
  );
  // place up to CPBB_REBUY_MAX limit orders
  for (let i = 0; i < process.env.CPBB_REBUY_MAX; i++) {
    let percentageDrop = multiply(baseDrop, i + 1); // e.g. -.5%, -1%, etc
    let price = add(basePrice, multiply(basePrice, percentageDrop)).toFixed(2);
    // if we are multiplying the btc size each drop point, do so (only if not the first order)
    if(multiplier && i) size = multiply(size, multiplier);
    let funds = multiply(Number(size), price);
    if(add(usedFunds, funds) > maxFunds){
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
    memory.makerOrders.orders.push({
      pair: config.productID,
      funds,
      id: orderResponse.id,
      price,
      size
    });
  }
  log.debug(`REBUY: set ${memory.makerOrders.orders.length} limit orders totalling $${usedFunds}`)
  // save makerOrders to disk in case this process crashes
  fs.writeFileSync(`${__dirname}/../data/maker.orders.json`, JSON.stringify(memory.makerOrders, null, 2));
}
