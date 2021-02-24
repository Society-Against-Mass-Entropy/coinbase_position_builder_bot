process.env.VERBOSE = "true";

const getOrder = require('../coinbase/get.order');

const id = process.argv[2];
console.log('checking order', id);
(async () => {
  response = await getOrder({ id });
  console.log({ response });
})()
