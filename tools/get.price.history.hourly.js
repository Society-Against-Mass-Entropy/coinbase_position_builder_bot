const getHistory = require('../coinbase/get.history');
const ticker = process.argv[2];
const fs = require('fs');
const sleep = require('../lib/sleep');

const start = '2016-01-01T00:00:00.000Z';

let startDate = new Date(start);
let endDate = new Date(start);

(async () => {
  const history = [];
  while (endDate.getTime() < new Date().getTime()) {
    if (history.length) {
      // 1 hour after last
      startDate.setTime(endDate.getTime() + 60 * 60 * 1000);
    }
    // 299 hours later (limit is 300 periods, but leap year throws this)
    endDate.setTime(startDate.getTime() + 60 * 60 * 1000 * 299);
    let startISO = startDate.toISOString();
    let endISO = endDate.toISOString();
    console.log(
      `getting rate history for ${ticker} from ${startISO} to ${endISO}`
    );
    let results = await getHistory(ticker, startISO, endISO, 3600);
    console.log(results[results.length - 1]);
    console.log(results[0]);
    history.push(...results);
    sleep(2000);
  }

  fs.writeFileSync(
    `${__dirname}/../data/rates.hourly.${ticker}.json`,
    JSON.stringify({
      hourly: history.sort((a, b) => (a[0] < b[0] ? -1 : 1)),
    })
  );
})();
