const calculateAction = require("./calculate.action");
const getCompletedOrder = require("./get.completed.order");
const getTicker = require("../coinbase/get.ticker");
const processOrder = require("./process.order");
const saveLog = require("./log.save");
const log = require("./log");

module.exports = async () => {
  const ticker = await getTicker();
  log("ticker", ticker);
  const action = await calculateAction(ticker);
  log("action", action);
  const orderResponse = await processOrder(action);
  log("orderResponse", orderResponse);
  const orderResponseComplete = await getCompletedOrder(orderResponse);
  log("orderResponseComplete", orderResponseComplete);

  saveLog({
    action,
    response: orderResponseComplete,
  });
};
