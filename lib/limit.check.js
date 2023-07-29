const { add, divide, multiply, subtract } = require('./math');
const config = require('../config');
const calculateAction = require('./calculate.action');
const cancelOrders = require('../coinbase/cancel.orders');
const fs = require('fs');
// const getFills = require('../coinbase/get.fills');
const getOrder = require('../coinbase/get.order');
const log = require('./log');
const memory = require('./memory');
const moment = require('moment');
const logSave = require('./log.save');
const sleep = require('./sleep');
const postRebuys = require('./rebuys.post');
const postResells = require('./resells.post');

const cancelOrder = async order => {
  log.debug(
    `🚫 canceled ${order.side} limit order ${order.order_id} for ${
      order.size
    } ${config.ticker} @${order.price} =$${Math.abs(order.funds)}`
  );
  await cancelOrders([order.order_id]);
  memory.makerOrders = memory.makerOrders.filter(
    o => o.order_id !== order.order_id
  );
};

module.exports = async ({ dateOverride }) => {
  log.debug(`checking ${memory.makerOrders.length} limits`, dateOverride);
  // check to see if any filled and add them to the ledger if they have
  // cancel any others (so we have a clean slate)
  // only pending orders for this pair (in case we are running multiple processes for different products)
  const pendingOrders = memory.makerOrders.filter(
    o => o.pair === config.productID
  );

  // get recent fills since the first limit order we have on record
  // const fills = await getFills({ since: pendingOrders[0].created_at });

  const remaining = [];
  for (let i = 0; i < pendingOrders.length; i++) {
    let order = pendingOrders[i];
    // log.zap(`limit checking order`, order);
    let { json, res } = await getOrder(order);
    // log.zap(json);

    // let filled = fills.find(f => f.order_id === order.order_id);

    if (!json?.order && res && res.statusCode === 404) {
      log.now(
        `🗑️  limit order ${order.order_id} not found (${res.statusCode}) (must have been deleted manually or through platform maintenance), removing from tracking db.`
      );
      memory.makerOrders = memory.makerOrders.filter(
        o => o.order_id !== order.order_id
      );
    } else if (!json?.order || !res) {
      log.now(
        `🔌 It looks like there was a network failure. We will leave limit order "${order.order_id}" alone and check back next pass.`
      );
      continue;
    } else if (json?.order?.settled) {
      // it's possible that the limit order was only partially filled
      // and is not yet settled. In that case, we will leave it alone

      // add it to the history
      // and set the funding value to the amount that was truly transacted
      let method = '';
      let isRebuy = order.side === 'BUY';
      let isResell = order.side === 'SELL';
      if (isRebuy) method = 'rebuy';
      if (isResell) method = 'resell';
      // log.zap(`LIMIT CHECK`, json);
      let funds = multiply(
        isResell
          ? subtract(json?.order?.filled_value, json?.order?.total_fees)
          : add(json?.order?.filled_value, json?.order?.total_fees),
        isResell ? -1 : 1
      );
      let action = await calculateAction({
        // if we set the date to the executed date, it will mess up our expected gain/period rates
        // as these have filled out of order
        dateOverride: dateOverride || new Date(), // new Date(json?.order?.done_at),
        forceBuy: isRebuy,
        method,
        forceSell: isResell,
        price: Number(json?.order?.average_filled_price),
        type: 'LIMIT',
        volOverride: funds,
      });
      // regardless of what the action calculated we should have done
      // force the action calculation result to be a buy or sell, depending on the limit
      // note: sells are negative in funds (we are taking funds out of the system)
      action.funds = funds;
      action.target = add(action.target, funds);
      log.debug(`${order.side} limit order filled!`, { order, json, action });
      logSave({
        action,
        order: json?.order,
      });
      memory.makerOrders = memory.makerOrders.filter(
        o => o.order_id !== order.order_id
      );
    } else {
      const killAfter = order.created_at
        ? new Date(order.created_at).getTime() +
          (order.side === 'SELL' ? config.resell.cancel : config.rebuy.cancel)
        : new Date().getTime() - config.rebuy.cancel;
      const now = new Date().getTime();
      const timeLeft = killAfter - now;
      if (killAfter <= now) {
        // delete the order from the books (it had its chance)
        await cancelOrder(order);
      } else {
        log.debug(
          `⏰ limit ${order.side} ${order.order_id} has more time: ${
            order.size
          } ${config.ticker} @${order.price} =$${Math.abs(
            order.funds
          )} | expires in ${moment
            .duration(timeLeft, 'milliseconds')
            .humanize()}`
        );
        remaining.push(order);
      }
    }
    // https://help.coinbase.com/en/pro/other-topics/api/faq-on-api#:~:text=What%20are%20the%20rate%20limits%20for%20Coinbase%20Pro%20API%3F&text=For%20Public%20Endpoints%2C%20our%20rate,requests%20per%20second%20in%20bursts.&text=The%20FIX%20API%20rate%20limit%20is%2050%20messages%20per%20second.
    // prevent api rate limiting (3 per second)
    await sleep(config.sleep.limitCheck);
  }

  // if we have set CPBB_REBUY_REBUILD/CPBB_RESELL_REBUILD threshold
  const remainingRebuys = remaining.filter(l => l.side === 'BUY');
  const remainingResells = remaining.filter(l => l.side === 'SELL');
  let rebuilt = false;
  if (
    config.rebuy &&
    remainingRebuys.length &&
    remainingRebuys.length >= config.rebuy.rebuild
  ) {
    let remainingFunds = remainingRebuys.reduce(
      (sum, order) => add(sum, order.funds),
      0
    );
    // the highest limit on the books
    let maxLimit = remainingRebuys.reduce((max, order) => {
      if (Number(order.price) > max) max = Number(order.price);
      return max;
    }, 0);
    // since the highest limit is already at drop[0], we need to reverse that calculation
    // so that the first limit will be at the highest limit and not another drop[0] below that
    // (so it isn't always moving down further)
    // increase the price by the first drop point %
    let basePrice = divide(maxLimit, add(1, config.rebuy.drops[0]));
    log.debug(
      `rebuilding ${remainingRebuys.length} buy limits with $${remainingFunds} starting at $${maxLimit} (base price $${basePrice})`
    );
    for (let i = 0; i < remainingRebuys.length; i++) {
      await cancelOrder(remainingRebuys[i]);
      // TODO: better way to handle rate limiting
      await sleep(config.sleep.cancelOrder);
    }
    // postRebuys writes the new makerOrders to disk
    await postRebuys(basePrice, remainingFunds);
    rebuilt = true;
  }
  if (
    config.resell &&
    remainingResells.length &&
    remainingResells.length >= config.resell.rebuild
  ) {
    let remainingFunds = remainingResells.reduce(
      (sum, order) => add(sum, Math.abs(order.funds)),
      0
    );
    // the lowest limit on the books
    let minLimit = remainingResells.reduce((min, order) => {
      if (Number(order.price) < min) min = Number(order.price);
      return min;
    }, Infinity);
    // since the lowest limit is already at pumps[0], we need to reverse that calculation
    // so that the first limit will be at the lowest limit and not another pumps[0] above that
    // (so it isn't always moving up higher)
    // increase the price by the first pump point %
    let basePrice = multiply(minLimit, add(1, config.resell.pumps[0]));
    log.debug(
      `rebuilding ${remainingResells.length} sell limits with $${remainingFunds} starting at $${minLimit} (base price $${basePrice})`
    );
    for (let i = 0; i < remainingResells.length; i++) {
      await cancelOrder(remainingResells[i]);
      // TODO: better way to handle rate limiting
      await sleep(config.sleep.cancelOrder);
    }
    // postResells writes the new makerOrders to disk
    await postResells(basePrice, remainingFunds);
    rebuilt = true;
  }

  if (!rebuilt && !process.env.CPBB_TEST) {
    // save makerOrders to disk in case this process crashes
    fs.writeFileSync(
      config.maker_file,
      JSON.stringify(memory.makerOrders, null, 2)
    );
  }
};
