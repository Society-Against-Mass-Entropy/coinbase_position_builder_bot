/**
 * usage: node get.price.history.js BTC-USD daily
 */
const getHistory = require('../coinbase/get.history');
const ticker = process.argv[2];
const fs = require('fs');
const sleep = require('../lib/sleep');

const start = '2016-01-01T00:00:00.000Z';

const intervalMap = {
  daily: 3600000 * 24,
  hourly: 3600000,
  '6hour': 3600000 * 6,
};
const interval = process.argv[3];

let startDate = new Date(start);
let endDate = new Date(start);

(async () => {
  const history = [];
  while (endDate.getTime() < new Date().getTime()) {
    if (history.length) {
      // 1 period after last
      startDate.setTime(endDate.getTime() + intervalMap[interval]);
    }
    // 299 periods later (limit is 300 periods, but leap year throws this)
    endDate.setTime(startDate.getTime() + intervalMap[interval] * 299);
    let startISO = startDate.toISOString();
    let endISO = endDate.toISOString();
    console.log(
      `getting rate history for ${ticker} from ${startISO} to ${endISO}`
    );
    let results = await getHistory(
      ticker,
      startISO,
      endISO,
      intervalMap[interval] / 1000
    );
    console.log(results[results.length - 1]);
    console.log(results[0]);
    history.push(...results);
    sleep(2000);
  }

  fs.writeFileSync(
    `${__dirname}/../data/rates.${ticker}.${interval}.json`,
    JSON.stringify({
      hourly: history.sort((a, b) => (a[0] < b[0] ? -1 : 1)),
    })
  );
})();
