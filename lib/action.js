const calculateAction = require("./calculate.action");
const getOrder = require("../coinbase/get.order");
const getTicker = require("../coinbase/get.ticker");
const processOrder = require("./process.order");
const saveLog = require("./log.save");
const log = require("./log");

module.exports = async () => {
  const ticker = await getTicker();
  log.debug("ticker", ticker);
  const action = await calculateAction(ticker);
  log.debug("action", action);
  const order = await processOrder(action);
  log.debug("order", order);

  // sometimes the order does not immediately settle
  // and we need to fetch it again to get completion data
  const response = order.settled ? order : await getOrder(response.id);

  saveLog({
    action,
    response,
  });
};
