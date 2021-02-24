const { add, divide } = require('mathjs');
const config = require('../config');
const calculateAction = require('./calculate.action');
const deleteOrder = require("../coinbase/delete.order");
const fs = require('fs');
const getOrder = require("../coinbase/get.order");
const log = require("./log");
const memory = require("./memory");
const saveLog = require("./log.save");
module.exports = async () => {
  // check to see if any filled and add them to the ledger if they have
  // cancel any others (so we have a clean slate)
  // only pending orders for this pair (in case we are running multiple processes for different products)
  const pendingOrders = memory.makerOrders.orders.filter(o => o.pair === config.productID);
  for (let i = 0; i < pendingOrders.length; i++) {
    let order = pendingOrders[i];
    log.debug(`checking order`, order);
    let response = await getOrder(order);
    // 404 (order was manually deleted or purged via market maintenance)
    if (!response) continue; // ignore this order
    if (response.settled) { // filled!
      // add it to the history
      // and set the funding value to the amount that was truly transacted
      let funds = add(Number(response.executed_value), Number(response.fill_fees));
      let price = divide(funds, Number(response.filled_size));
      //log.debug(response.executed_value, response.fill_fees, Number(response.executed_value), Number(response.fill_fees), { funds, price });
      let action = await calculateAction({
        dateOverride: new Date(response.done_at),
        forceBuy: true,
        price,
        type: 'limit',
        volOverride: funds
      });
      // force the action to be a buy (even though it may have calculated that it should have sold)
      action.funds = Math.abs(action.funds);
      log.debug(`limit order filled!`, { order, response, action });
      saveLog({
        action,
        response,
      });
    } else {
      // delete the order from the books (it had its chance)
      log.now(`🚫 canceled limit order ${order.id} for ${order.size} ${config.ticker} @ ${order.price} = $${order.funds}`);

      deleteOrder(order.id); // no need to await
    }
  }
  memory.makerOrders.orders = memory.makerOrders.orders.filter(o => o.pair !== config.productID); // purge these from the active memory of orders to track (they either filled or were deleted)
  // save makerOrders to disk in case this process crashes
  fs.writeFileSync(config.maker_file, JSON.stringify(memory.makerOrders, null, 2));
}
