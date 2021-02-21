const { divide } = require('mathjs');
const calculateAction = require('./calculate.action');
const deleteOrder = require("../coinbase/delete.order");
const getOrder = require("../coinbase/get.order");
// const log = require("./log");
const memory = require("../data/memory");
const saveLog = require("./log.save");
module.exports = async () => {
  // check to see if any filled and add them to the ledger if they have
  // cancel any others (so we have a clean slate)
  for (let i = 0; i < memory.makerOrders.orders.length; i++) {
    let order = memory.makerOrders.orders[i];
    let orderStatus = await getOrder(order.id);
    if (orderStatus.settled) { // filled!
      // add it to the history
      let price = divide(orderStatus.executed_value, orderStatus.filled_size);
      let action = calculateAction({
        dateOverride: new Date(orderStatus.done_at),
        price,
        type: 'limit',
        volOverride: Number(process.env.CPBB_REBUY_VOL)
      });
      // force the action to be a buy (even though it may have calculated that it should have sold)
      action.funds = Math.abs(action.funds);
      saveLog({
        action,
        orderStatus,
      });
    } else {
      // delete the order from the books (it had its chance)
      log.now(`order ${order.id} of ${order}`)
      deleteOrder(order.id); // no need to await
    }
  }
}
