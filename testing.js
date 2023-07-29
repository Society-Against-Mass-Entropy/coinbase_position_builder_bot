// const getProduct = require('./coinbase/get.products');

// (async () => {
//   const prod = await getProduct();

//   console.log(prod);
// })();

// const accounts = require('./coinbase/accounts');
const log = require('./lib/log');
const getOrder = require('./coinbase/get.order');

(async () => {
  // const account = await accounts();

  // console.log(account);

  const { json } = await getOrder({
    order_id: '6cd499eb-2d2a-4285-a534-c51561ab6aa9',
  });

  log.ok(json);
})();
