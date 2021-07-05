const fs = require('fs');

const history = require('../data/rates.BTC-USD.hourly.json').hourly;

const sorted = history.sort((a, b) => (a[0] < b[0] ? -1 : 1));

sorted.forEach(o => console.log(o));

fs.writeFileSync(
  '../data/rates.BTC-USD.hourly-sorted.json',
  JSON.stringify({
    hourly: sorted,
  })
);
