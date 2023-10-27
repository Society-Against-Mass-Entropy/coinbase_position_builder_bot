const fs = require('fs');

const { divide, precision } = require('../lib/math');

const upholdFile = `${__dirname}/../data/uphold.csv`;

const upholdData = fs.readFileSync(upholdFile, 'utf8');

const upholdLines = upholdData.split('\n');
const upholdHeaders = upholdLines.shift().split(',');
const uphold = upholdLines.map(line => {
  const parts = line.split(',');
  const obj = {};
  upholdHeaders.forEach((header, i) => {
    obj[header] = parts[i];
  });
  return obj;
});

const history = [];
for (let i = 0; i < uphold.length; i++) {
  const line = uphold[i];
  const dest = line['Destination Currency'];
  const origin = line['Origin Currency'];
  const destAmount = line['Destination Amount'];
  const originAmount = line['Origin Amount'];
  if (origin !== 'USD' && dest !== 'USD') continue;
  if (origin !== 'BTC' && dest !== 'BTC') continue;

  history.push({
    Time: new Date(line.Date).toISOString(),
    Price:
      origin === 'USD'
        ? precision(divide(originAmount, destAmount), 2)
        : precision(divide(destAmount, originAmount), 2),
    Holding: '',
    Value: '',
    Funds: origin === 'USD' ? originAmount : -destAmount,
    Shares: origin === 'USD' ? destAmount : -originAmount,
  });
}

// write new history file
const data = [
  `Time\tPrice\tHolding\tValue\tFunds\tShares`,
  ...history.map(row => Object.values(row).join('\t')),
].join('\n');

// log.debug(data)
const file = `${__dirname}/../data/history.uphold.tsv`;
fs.writeFileSync(file, data);
