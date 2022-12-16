// const getProduct = require('./coinbase/get.products');

// (async () => {
//   const prod = await getProduct();

//   console.log(prod);
// })();

const accounts = require('./coinbase/accounts');

(async () => {
  const account = await accounts();

  console.log(account);
})();
