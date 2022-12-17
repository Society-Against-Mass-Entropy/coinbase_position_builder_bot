const request = require('./cb.request');

module.exports = async (productID, start, end, granularity) => {
  const result = await request({
    requestPath: `/api/v3/brokerage/products/${productID}/candles?start=${start}&end=${end}&granularity=${granularity}`,
    method: 'GET',
  });
  return result ? result.json.candles : result;
};
