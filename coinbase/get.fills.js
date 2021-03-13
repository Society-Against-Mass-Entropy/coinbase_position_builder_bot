const request = require('./cb.request');
const config = require('../config');
const log = require('../lib/log');
const sleep = require('../lib/sleep');

module.exports = async ({ since }) => {
  const sinceDate = new Date(since);
  // fetch fill data since the iso8601 datetime provided
  log.ok(
    `getting historical fill information for ${config.productID} since ${since}`
  );
  let fills = [];
  let nextPage = 0;
  for (let i = 0; i < 1000; i++) {
    let { json, res } = await request({
      requestPath: `/fills?product_id=${config.productID}${
        nextPage ? `&after=${nextPage}` : ''
      }`,
      method: 'GET',
    }).catch(e => {
      console.error(
        e,
        `failed to get fills history for ${config.productID}. Please make sure this ticker exists.`
      );
      process.exit();
    });
    nextPage = res.headers['cb-after'];
    if (!json || !json.length) break;
    fills = [...fills, ...json];
    log.ok(json[json.length - 1].created_at, `${json.length} records`);
    // done requesting once we have a fill at or before our since
    if (new Date(json[json.length - 1].created_at) <= sinceDate) break;
    await sleep(1000); // avoid rate limit issues
  }
  return fills.filter(f => new Date(f.created_at) >= sinceDate);
};
