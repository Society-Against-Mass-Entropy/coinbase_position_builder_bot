const { add, divide, subtract } = require('./math');
const config = require('../config');
const calculateAction = require('./calculate.action');
const deleteOrder = require('../coinbase/delete.order');
const fs = require('fs');
// const getFills = require('../coinbase/get.fills');
const getOrder = require('../coinbase/get.order');
const log = require('./log');
const memory = require('./memory');
const moment = require('moment');
const saveLog = require('./log.save');
const sleep = require('./sleep');
const postRebuys = require('./rebuys.post');

const cancelOrder = async order => {
  log.now(
    `🚫 canceled limit order ${order.id} for ${order.size} ${config.ticker} @ ${order.price} = $${order.funds}`
  );
  await deleteOrder(order.id);
  memory.makerOrders.orders = memory.makerOrders.orders.filter(
    o => o.id !== order.id
  );
};

module.exports = async () => {
  // check to see if any filled and add them to the ledger if they have
  // cancel any others (so we have a clean slate)
  // only pending orders for this pair (in case we are running multiple processes for different products)
  const pendingOrders = memory.makerOrders.orders.filter(
    o => o.pair === config.productID
  );

  // get recent fills since the first limit order we have on record
  // const fills = await getFills({ since: pendingOrders[0].created_at });

  const remaining = [];
  for (let i = 0; i < pendingOrders.length; i++) {
    let order = pendingOrders[i];
    log.debug(`checking order`, order);
    let response = await getOrder(order);
    // let filled = fills.find(f => f.order_id === order.id);

    if (!response) {
      log.now(
        `🗑️ limit order ${order.id} not found (must have been deleted manually or through Coinbase maintenance), removing from tracking db.`
      );
      memory.makerOrders.orders = memory.makerOrders.orders.filter(
        o => o.id !== order.id
      );
    } else if (response && response.settled) {
      // it's possible that the limit order was only partially filled
      // and is not yet settled. In that case, we will leave it alone

      // get order status with done_at time (for some reason not returned in fills api)
      // let response = await getOrder(order);
      // add it to the history
      // and set the funding value to the amount that was truly transacted
      let funds = add(response.executed_value, response.fill_fees);
      let action = await calculateAction({
        dateOverride: new Date(response.done_at),
        forceBuy: true,
        price: Number(response.price),
        type: 'limit',
        volOverride: funds,
      });
      // force the action to be a buy (even though it may have calculated that it should have sold)
      action.funds = Math.abs(action.funds);
      log.debug(`limit order filled!`, { order, response, action });
      saveLog({
        action,
        response,
      });
      memory.makerOrders.orders = memory.makerOrders.orders.filter(
        o => o.id !== order.id
      );
    } else {
      const killAfter = order.created_at
        ? new Date(order.created_at).getTime() + config.rebuy.cancel
        : new Date().getTime() - config.rebuy.cancel;
      const now = new Date().getTime();
      const timeLeft = killAfter - now;
      if (killAfter <= now) {
        // delete the order from the books (it had its chance)
        await cancelOrder(order);
      } else {
        log.now(
          `⏰ limit ${order.id} has more time: ${order.size} ${
            config.ticker
          } @ ${order.price} = $${order.funds} | expires ${moment
            .duration(timeLeft, 'milliseconds')
            .humanize()}`
        );
        remaining.push(order);
      }
    }
    // https://help.coinbase.com/en/pro/other-topics/api/faq-on-api#:~:text=What%20are%20the%20rate%20limits%20for%20Coinbase%20Pro%20API%3F&text=For%20Public%20Endpoints%2C%20our%20rate,requests%20per%20second%20in%20bursts.&text=The%20FIX%20API%20rate%20limit%20is%2050%20messages%20per%20second.
    // prevent api rate limiting (3 per second)
    await sleep(1000);
  }

  // if we have set CPBB_REBUY_REBUILD threshold
  if (remaining.length >= config.rebuy.rebuild) {
    const remainingFunds = remaining.reduce(
      (sum, order) => add(sum, order.funds),
      0
    );
    // the highest limit on the books
    const maxLimit = remaining.reduce((max, order) => {
      if (Number(order.price) > max) max = Number(order.price);
      return max;
    }, 0);
    // since the highest limit is already at drop[0], we need to reverse that calculation
    // so that the first limit will be at the highest limit and not another drop[0] below that
    // (so it isn't always moving down further)
    // increase the price by the first drop point %
    const basePrice = divide(maxLimit, add(1, config.rebuy.drops[0]));
    log.zap(
      `rebuilding ${remaining.length} limits with $${remainingFunds} starting at $${maxLimit} (base price $${basePrice})`
    );
    for (let i = 0; i < remaining.length; i++) {
      await cancelOrder(remaining[i]);
      // TODO: better way to handle rate limiting
      await sleep(500);
    }
    // postRebuys writes the new makerOrders to disk
    await postRebuys(basePrice, remainingFunds);
  } else {
    // save makerOrders to disk in case this process crashes
    fs.writeFileSync(
      config.maker_file,
      JSON.stringify(memory.makerOrders, null, 2)
    );
  }
};
