/**
 * Handles rebuying after a sell by setting up limit orders on the books using special config vars
 * Sample env config:
// should the engine only create and manage the limit orders and not make normal accumulation trades
// useful for testing this feature
CPBB_REBUY_ONLY: false,
// maximum dollar value consumed by limit order placements
CPBB_REBUY_MAX: 50,
// rebuy logic will place orders at this size until CPBB_REBUY_MAX is reached
CPBB_REBUY:'.0001@4,.0002@6,.0003@8,.0004@10,.0005@12,.001@15,.002@20,.004@25,.008@30,.016@35,.032@40,.064@50,.128@60,.256@70,.512@80,1.024@90',
 */
const { add, divide, multiply, subtract } = require('./math');
const config = require('../config');
const fs = require('fs');
const log = require('./log');
const memory = require('./memory');
const processOrder = require('./process.order');
const sleep = require('./sleep');
module.exports = async (basePrice, maxFundsOverride) => {
  // starting percentage down from basePrice to place limit orders
  const dropPoints = config.rebuy.drops;
  // only set orders until they reach this threshold total
  const maxFunds = maxFundsOverride || config.rebuy.max;
  const sizes = config.rebuy.sizes;
  log.zap(
    `Creating limit orders to rebuy $${maxFunds} worth of ${config.ticker} starting from $${basePrice}`
  );
  let usedFunds = 0;
  let lastOrder;
  const orders = [];

  // first construct the set of orders
  for (let i = 0; i < sizes.length; i++) {
    if (usedFunds >= maxFunds) {
      break; // done
    }
    let percentageDrop = dropPoints[i];
    let size = sizes[i];
    let price = add(basePrice, multiply(basePrice, percentageDrop)).toFixed(2);
    let funds = multiply(size, price).toFixed(4);
    if (add(usedFunds, funds) > maxFunds) {
      // this attmept would exceed the allowed limit
      // use whatever is left of the funds on this last drop point
      funds = subtract(maxFunds, usedFunds);
      // size now depends on the funds used
      size = divide(funds, price).toFixed(memory.product.precision);
      // if this order would be too small, add the funds to the last order
      if (Number(size) < Number(memory.product.base_min_size)) {
        if (!lastOrder) {
          // obscure scenario: first order is too small
          log.now(
            `Funds (${funds}) would make order size ${size}, too small for ${memory.product.base_min_size}. Cannot place order.`
          );
          break;
        }
        lastOrder.funds = add(lastOrder.funds, funds);
        lastOrder.size = add(lastOrder.size, size).toFixed(
          memory.product.precision
        );
        usedFunds = add(usedFunds, funds);
        break;
      }
    }
    usedFunds = add(usedFunds, funds);
    lastOrder = {
      funds,
      percentageDrop,
      price,
      size,
      type: 'limit',
    };
    orders.push(lastOrder);
  }
  // now place all the orders
  let addedOrders = 0;
  for (let i = 0; i < orders.length; i++) {
    let order = orders[i];
    let orderResponse = await processOrder(order, 2);
    log.debug({ order, orderResponse });
    await sleep(config.sleep.rebuyPost); // avoid rate limiting
    const detailLog = `limit order for ${order.size} ${config.ticker} @ ${
      order.price
    } = $${order.funds} (${multiply(order.percentageDrop, 100)}% drop)`;
    if (!orderResponse) {
      log.error(`Failed to place ${detailLog}`);
      continue;
    }
    log.now(`⬇️  posted ${detailLog}`);
    addedOrders++;
    memory.makerOrders.orders.push({
      created_at: orderResponse.created_at,
      pair: config.productID,
      funds: order.funds,
      id: orderResponse.id,
      price: order.price,
      size: order.size,
    });
  }
  const limitTotal = memory.makerOrders.orders.reduce(
    (sum, order) => add(sum, order.funds),
    0
  );
  log.ok(
    `REBUY: Added ${addedOrders} limit buys totaling $${usedFunds}. Now ${memory.makerOrders.orders.length} limit orders totaling $${limitTotal}`
  );
  // save makerOrders to disk in case this process crashes
  fs.writeFileSync(
    config.maker_file,
    JSON.stringify(memory.makerOrders, null, 2)
  );
};
