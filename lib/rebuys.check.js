const { divide } = require('mathjs');
const calculateAction = require('./calculate.action');
const deleteOrder = require("../coinbase/delete.order");
const getOrder = require("../coinbase/get.order");
const log = require("./log");
const memory = require("../data/memory");
const numberFix = require('./number.fix');
const saveLog = require("./log.save");
module.exports = async () => {
  // check to see if any filled and add them to the ledger if they have
  // cancel any others (so we have a clean slate)
  for (let i = 0; i < memory.makerOrders.orders.length; i++) {
    let order = memory.makerOrders.orders[i];
    log.debug(`checking order`, order);
    let response = await getOrder(order);
    // 404 (order was manually deleted or purged via market maintenance)
    if(!response) continue; // ignore this order
    if (response.settled) { // filled!
      // add it to the history
      // and set the funding value to the amount that was truly transacted
      let funds = Number(response.executed_value);
      let price = numberFix(divide(funds, Number(response.filled_size)), 2);
      let action = await calculateAction({
        dateOverride: new Date(response.done_at),
        forceBuy: true,
        price,
        type: 'limit',
        volOverride: numberFix(funds, 2)
      });
      // force the action to be a buy (even though it may have calculated that it should have sold)
      action.funds = Math.abs(action.funds);
      log.debug(`limit order filled!`, {order, response, action});
      saveLog({
        action,
        response,
      });
    } else {
      // delete the order from the books (it had its chance)
      log.debug(`limit order cleanup ${order.id} of`, order)
      deleteOrder(order.id); // no need to await
    }
  }
  memory.makerOrders.orders = []; // purge these from the active memory of orders to track (they either filled or were deleted)
}
