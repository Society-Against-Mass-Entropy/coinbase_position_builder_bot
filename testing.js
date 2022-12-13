const accounts = require('./coinbase/accounts');

(async () => {
  const account = await accounts();

  console.log(account);
})();
