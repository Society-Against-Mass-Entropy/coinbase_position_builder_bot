const { divide } = require('mathjs');
const fs = require('fs');
const log = require("./log");
const memory = require("../data/memory");
module.exports = async () => {
  // get the real executed price (not the value from the ticker request)
  const basePrice = divide(response.executed_value, response.filled_size);
  // CPBB_REBUY_ORDERS as increments of CPBB_REBUY_VOL at CPBB_REBUY_AT increments of the price
  const baseDrop = divide(Number(process.env.CPBB_REBUY_AT), 100);
  const funds = Number(process.env.CPBB_REBUY_VOL);
  log.now(`REBUY triggered: setting ${process.env.CPBB_REBUY_ORDERS} limit orders for ${funds}`);
  for (let i = 0; i < process.env.CPBB_REBUY_ORDERS; i++) {
    let percentageDrop = multiply(baseDrop, i + 1); // e.g. -.5%, -1%, etc
    let price = add(basePrice, multiply(basePrice, percentageDrop));
    let size = divide(Math.abs(funds), price);
    let order = {
      funds,
      price,
      size,
      type: 'limit',
    };
    let orderResponse = await processOrder(order);
    log.now({ order, orderResponse });
    memory.makerOrders.orders.push({
      id: orderResponse.id,
      funds,
      price,
      size
    });
  }
  // save makerOrders to disk in case this process crashes
  fs.writeFileSync('../data/maker.orders.json', JSON.stringify(memory.makerOrders, null, 2))
}
