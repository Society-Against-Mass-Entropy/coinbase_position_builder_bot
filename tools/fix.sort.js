const fs = require('fs');

const history = require('../data/rates.hourly.BTC-USD.json').hourly;

const sorted = history.sort((a, b) => (a[0] < b[0] ? -1 : 1));

sorted.forEach(o => console.log(o));

fs.writeFileSync(
  '../data/rates.hourly.BTC-USD-sorted.json',
  JSON.stringify({
    hourly: sorted,
  })
);
