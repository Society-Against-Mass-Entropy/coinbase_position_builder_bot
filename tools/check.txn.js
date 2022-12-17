process.env.VERBOSE = 'true';

const getOrder = require('../coinbase/get.order');
const log = require('../lib/log');

const id = process.argv[2];
(async () => {
  log.now('checking order', id);
  const { json } = await getOrder({ id });
  log.ok({ json });
})();
