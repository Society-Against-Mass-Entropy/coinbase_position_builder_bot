const calculateAction = require('./calculate.action');
const config = require('../config');
const { divide } = require('./math'); // simple math helper
const getOrder = require('../coinbase/get.order');
const getProduct = require('../coinbase/get.product');
const log = require('./log');
const memory = require('./memory');
const processOrder = require('./process.order');
const logSave = require('./log.save');
const postRebuys = require('./rebuys.post');
const postResells = require('./resells.post');
const checkLimits = require('./limit.check');
const sleep = require('./sleep');
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}
module.exports = async (opts = {}) => {
  // bot detection/manipulation delay
  if (process.env.CPBB_RANDOM_DELAY) {
    await sleep(getRandomInt(process.env.CPBB_RANDOM_DELAY * 60 * 1000));
  }
  // before processing this period, we need to check on any pending market rebuy orders
  if (memory.makerOrders.length) {
    // console.log(`checking limits, ${memory.makerOrders.length}`);
    await checkLimits(opts);
  }

  // ok, now we can move on with the primary action
  const product =
    opts && opts.productOverride ? opts.productOverride : await getProduct();

  if (!product) {
    log.error('it appears we could not fetch the product. Restarting app...');
    process.exit();
  }

  // store the latest price
  // if we are reversing the pair (e.g. LTCBTC in service of buying BTC with LTC)
  // then we have to invert the price.
  // for example: if LTCBTC price is 0.004785, meaning 1 LTC for 0.004785 BTC,
  // we invert it to 1/0.004785 = 208.98641588 LTC for 1 BTC (this puts it into a price we can work with)
  memory.price = config.reverse
    ? divide(1, product.price)
    : Number(product.price);
  product.price = memory.price;
  log.debug('product', product);

  if (config.limitOnly) {
    // console.log('posting rebuys');
    await postRebuys(product.price);
    return;
  }

  const action = await calculateAction({
    ...opts,
    price: product.price,
    method: 'cron',
  });
  log.debug('action', action);
  let order = await processOrder(action);
  // log.ok('order', order);

  if (!order) {
    log.error(
      'Order failed. If this is not because of an Insufficient Funds error, please file a bug report on https://github.com/Society-Against-Mass-Entropy/coinbase_position_builder_bot/issues so we can investigate and add fault tolerance for this case.'
    );
    return;
  }

  if (!order.order_id) {
    return log.error(`no order id, order not created`, order);
  }

  // coinbase no longer returns the order info immediately and we have to request it
  // log.zap(`getOrder`, order);
  const result = await getOrder(order);
  // log.zap(`getOrder result`, result);
  if (!result?.json?.order) {
    log.error(
      'Cannot get order status. Dropping this action moment to prevent the possibility of continuous ordering',
      result.res.statusCode,
      result.res.statusMessage
    );
    return;
  }
  order = result.json.order;
  // log.ok('order data', order);

  // console.log({ action, order });
  // fix cost to actual executed price (including fees)
  action.price =
    action.side === 'SELL'
      ? divide(
          Math.abs(order.total_value_after_fees),
          Math.abs(order.filled_size)
        )
      : divide(Math.abs(action.funds), order.filled_size);

  logSave({
    action,
    order,
  });

  // if configured to add limit resell orders with the bought asset, do so now
  if (config.resell.max && action.funds > 0) {
    // just bought
    // get the real executed price (not the value from the product request)
    await postResells(action.price);
  }
  // if configured to add limit rebuy orders with the sold profits, do so now
  if (config.rebuy.max && action.funds < 0) {
    // just sold
    // get the real executed price (not the value from the product request)
    await postRebuys(action.price);
  }
};
