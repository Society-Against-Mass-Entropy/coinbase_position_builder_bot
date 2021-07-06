/**
 * fetch limit orders on the books and update the local limit order file
 * NOTE: if you have any limits that you are self-managing (e.g. Bitcoin at $0.01),
 * you might want to remove them from the file (otherwise, the rebuild will delete them)
 */

// usage:
// cd tools; CPBB_TICKER=BTC node get.limits.js
// then check up on the file to make sure it looks right and restart your service

const config = require('../config');
const getOrders = require('../coinbase/get.orders');
const fs = require('fs');
const log = require('../lib/log');
const memory = require('../lib/memory');
const { multiply } = require('../lib/math');

log.zap('updating orders db file with orders from the remote books');
(async () => {
  const json = await getOrders({ status: 'open' });
  if (!json) {
    log.error('failed to fetch orders.');
    return;
  }
  memory.makerOrders = json
    .filter(o => o.side === 'buy')
    .map(o => ({
      created_at: o.created_at,
      pair: o.product_id,
      funds: multiply(o.size, o.price).toFixed(4),
      id: o.id,
      price: o.price,
      size: Number(o.size),
    }))
    .sort((a, b) => {
      return Number(a.price) > Number(b.price) ? -1 : 1;
    });
  log.ok(`found ${memory.makerOrders.length} orders`);
  // we store a lighter schema:
  /**
 * {
      "created_at": "2021-03-13T14:05:37.303873Z",
      "pair": "BTC-USD",
      "funds": "5.6304",
      "id": "[UUID]",
      "price": "56304.31",
      "size": 0.0001
    },
 */
  // save makerOrders to disk in case this process crashes
  const outputFile = config.maker_file.replace('.json', '.restored.json');
  fs.writeFileSync(outputFile, JSON.stringify(memory.makerOrders, null, 2));
  log.ok(
    `check ${outputFile} to make sure it looks right. Copy it over your original file and restart service`
  );
})();
