const calculateAction = require('./calculate.action');
const config = require('../config');
const { divide } = require('./math'); // simple math helper
const getOrder = require('../coinbase/get.order');
const getTicker = require('../coinbase/get.ticker');
const log = require('./log');
const memory = require('./memory');
const processOrder = require('./process.order');
const saveLog = require('./log.save');
const postRebuys = require('./rebuys.post');
const checkRebuys = require('./rebuys.check');

module.exports = async opts => {
  // before processing this period, we need to check on any pending market rebuy orders
  if (memory.makerOrders.orders.length) {
    await checkRebuys();
  }

  // ok, now we can move on with the primary action
  const ticker =
    opts && opts.tickerOverride ? opts.tickerOverride : await getTicker();

  // store the latest price
  // if we are reversing the pair (e.g. LTCBTC in service of buying BTC with LTC)
  // then we have to invert the price.
  // for example: if LTCBTC price is 0.004785, meaning 1 LTC for 0.004785 BTC,
  // we invert it to 1/0.004785 = 208.98641588 LTC for 1 BTC (this puts it into a price we can work with)
  memory.price = config.reverse
    ? divide(1, ticker.price)
    : Number(ticker.price);
  ticker.price = memory.price;
  log.debug('ticker', ticker);

  if (config.rebuy.only) {
    await postRebuys(ticker.price);
    return;
  }

  const action = await calculateAction(ticker);
  log.debug('action', action);
  let order = await processOrder(action);
  log.debug('order', order);

  if (!order) {
    log.error(
      'Order failed. If this is not because of an Insufficient Funds error, please file a bug report on https://github.com/jasonedison/coinbase_position_builder_bot/issues so we can investigate and add fault tolerance for this case.'
    );
    return;
  }

  // sometimes the order does not immediately settle
  // and we need to fetch it again to get completion data
  let response = order;
  if (!response.settled) response = await getOrder(order);

  log.debug({ response });
  // fix price to actual executed price
  action.price = divide(response.executed_value, response.filled_size);

  saveLog({
    action,
    response,
  });

  // if configured to add limit rebuy orders with the sold profits, do so now
  if (config.rebuy.max && action.funds < 0) {
    // just sold
    // get the real executed price (not the value from the ticker request)
    await postRebuys(action.price);
  }
};
