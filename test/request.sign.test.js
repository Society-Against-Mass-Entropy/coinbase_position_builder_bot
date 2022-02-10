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
  expect(signature).toEqual('L337iiKjz8IEcFlHG3lu/CtcKXlXm2bsV3d5c0ZGFeg=');
});
