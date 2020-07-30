const calculateAction = require("./calculate.action");
const config = require('../config');
const { divide } = require('mathjs');
const getOrder = require("../coinbase/get.order");
const getTicker = require("../coinbase/get.ticker");
const log = require("./log");
const memory = require("../data/memory");
const processOrder = require("./process.order");
const saveLog = require("./log.save");

module.exports = async () => {
  const ticker = await getTicker();

  // store the latest price
  // if we are reversing the pair (e.g. LTCBTC in service of buying BTC with LTC)
  // then we have to invert the price.
  // for example: if LTCBTC price is 0.004785, meaning 1 LTC for 0.004785 BTC,
  // we invert it to 1/0.004785 = 208.98641588 LTC for 1 BTC (this puts it into a price we can work with)
  memory.price = config.reverse ? divide(1, Number(ticker.price)) : Number(ticker.price);
  ticker.price = memory.price;
  log.debug("ticker", ticker);
  const action = await calculateAction(ticker);
  log.debug("action", action);
  const order = await processOrder(action);
  log.debug("order", order);

  // sometimes the order does not immediately settle
  // and we need to fetch it again to get completion data
  let response = order;
  if (!response.settled) response = await getOrder(order);

  log.debug({ response });

  saveLog({
    action,
    response,
  });
};
