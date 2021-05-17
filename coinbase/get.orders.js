const config = require('../config');
const request = require('./cb.request');
const sleep = require('../lib/sleep');
module.exports = async ({ status }) => {
  let orders = [];
  let nextPage = 0;
  for (let i = 0; i < 1000; i++) {
    let { json, res } = await request({
      requestPath:
        `/orders?product_id=${config.productID}` +
        (status ? `&status=${status}` : '') +
        (nextPage ? `&after=${nextPage}` : ''),
      method: 'GET',
    }).catch(e => {
      console.error(
        e,
        `failed to get orders for ${config.productID}. Please make sure this ticker exists and that your network is connected.`
      );
      process.exit();
    });
    nextPage = res.headers['cb-after'];
    if (!json || !json.length) break;
    orders = [...orders, ...json];
    // done requesting once we have a fill at or before our since
    await sleep(1000); // avoid rate limit issues
  }
  return orders;
};
