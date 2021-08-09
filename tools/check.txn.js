process.env.VERBOSE = 'true';

const getOrder = require('../coinbase/get.order');
const log = require('../lib/log');

const id = process.argv[2];
log.debug('checking order', id);
(async () => {
  const { json } = await getOrder({ id });
  log.ok({ json });
})();
