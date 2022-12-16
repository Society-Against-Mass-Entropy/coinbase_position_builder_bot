const config = require('../config');
const requestSign = require('../coinbase/request.sign');

test('sign a request', () => {
  config.CPBB_APISEC = 'test';
  const signature = requestSign({
    timestamp: 1614460439.802,
    requestPath: `/test`,
    body: '',
    method: 'GET',
  });
  expect(signature).toEqual(
    'cc4eb654e3c10670015028089ad36c93d8afb3135a18f36948c0add19c5b5362'
  );
});
