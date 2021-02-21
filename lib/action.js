const calculateAction = require("./calculate.action");
const config = require('../config');
const { divide } = require('mathjs');
const deleteOrder = require("../coinbase/delete.order");
const getOrder = require("../coinbase/get.order");
const getTicker = require("../coinbase/get.ticker");
const log = require("./log");
const memory = require("../data/memory");
const processOrder = require("./process.order");
const saveLog = require("./log.save");

module.exports = async () => {

  // before processing this period, we need to check on any pending market rebuy orders
  const pendingLimitOrders = memory.makerOrders.orders.length;
  if(pendingLimitOrders){
    // check to see if any filled and add them to the ledger if they have
    // then cancel any others (so we have a clean slate)
    for(let i=0;i<pendingLimitOrders;i++){
      let orderAction = memory.makerOrders.orders[i];
      let orderStatus = await getOrder(orderAction.id);
      if(orderStatus.settled){ // filled!
        // add it to the history
        let price = divide(orderStatus.executed_value, orderStatus.filled_size);
        saveLog({
          orderAction, // TODO: construct this object fully using calculateAction
          orderStatus,
        });
      }else{
        // delete the order from the books (it had its chance)
        deleteOrder(orderAction.id); // no need to await
      }
    }
  }

  // ok, now we can move on with the primary action
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
  if (!response.settled) response = await getOrder(order.id);

  // if configured to add limit rebuy orders with the sold profits, do so now
  if(process.env.CPBB_REBUY_VOL && action.funds < 0){ // just sold
    // get the real executed price (not the value from the ticker request)
    let price = divide(response.executed_value, response.filled_size);
    // CPBB_REBUY_ORDERS as increments of CPBB_REBUY_VOL at CPBB_REBUY_AT increments of the price
    let limitOrder = await processOrder({
      type: 'limit',
      funds: Number(process.env.CPBB_REBUY_VOL)
    });
    memory.makerOrders.orders.push({
      id: limitOrder.id,
      price: 
    })
  }

  log.debug({ response });

  saveLog({
    action,
    response,
  });
};
