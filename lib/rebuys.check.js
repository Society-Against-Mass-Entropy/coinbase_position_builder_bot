const { add, divide } = require('./math');
const config = require('../config');
const calculateAction = require('./calculate.action');
const deleteOrder = require("../coinbase/delete.order");
const fs = require('fs');
const getFills = require('../coinbase/get.fills');
const getOrder = require("../coinbase/get.order");
const log = require("./log");
const memory = require("./memory");
const moment = require('moment');
const saveLog = require("./log.save");
module.exports = async () => {
  // check to see if any filled and add them to the ledger if they have
  // cancel any others (so we have a clean slate)
  // only pending orders for this pair (in case we are running multiple processes for different products)
  const pendingOrders = memory.makerOrders.orders.filter(o => o.pair === config.productID);

  // get recent fills since the first limit order we have on record
  const fills = await getFills({ since: pendingOrders[0].created_at });

  for (let i = 0; i < pendingOrders.length; i++) {
    let order = pendingOrders[i];
    log.debug(`checking order`, order);
    let filled = fills.find(f => f.order_id === order.id);

    // it's possible that the limit order was only partially filled
    // and is not yet settled. In that case, we will leave it alone
    if (filled && filled.settled) {
      // get order status with done_at time (for some reason not returned in fills api)
      let response = await getOrder(order);
      // add it to the history
      // and set the funding value to the amount that was truly transacted
      let funds = add(response.executed_value, response.fill_fees);
      let price = divide(funds, response.filled_size);
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
      const killAfter = order.created_at ? new Date(order.created_at).getTime() + config.rebuy.cancel : new Date().getTime() - config.rebuy.cancel;
      const now = new Date().getTime();
      const remaining = killAfter - now;
      if (killAfter <= now) {
        // delete the order from the books (it had its chance)
        log.now(`🚫 canceled limit order ${order.id} for ${order.size} ${config.ticker} @ ${order.price} = $${order.funds}`);
        deleteOrder(order.id); // no need to await
      } else {
        log.now(`⏰ limit order ${order.id} remains for ${order.size} ${config.ticker} @ ${order.price} = $${order.funds} | expires ${moment.duration(remaining, 'milliseconds').humanize()}`);
      }
    }
  }
  memory.makerOrders.orders = memory.makerOrders.orders.filter(o => o.pair !== config.productID); // purge these from the active memory of orders to track (they either filled or were deleted)
  // save makerOrders to disk in case this process crashes
  fs.writeFileSync(config.maker_file, JSON.stringify(memory.makerOrders, null, 2));
}
