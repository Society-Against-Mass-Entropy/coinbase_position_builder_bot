const fs = require('fs');

const { divide, precision } = require('../lib/math');

const file = `${__dirname}/../data/cash_app_report_btc.tsv`;

const data = fs.readFileSync(file, 'utf8');

const lines = data.split('\n');
const headers = lines.shift().split('\t');
const rows = lines.map(line => {
  const parts = line.split('\t');
  const obj = {};
  headers.forEach((header, i) => {
    obj[header] = parts[i].replace(/"/g, '');
  });
  return obj;
});

console.log(`${rows.length} rows`, headers);

const history = [];
for (let i = 0; i < rows.length; i++) {
  const line = rows[i];
  if (!['Bitcoin Sale', 'Bitcoin Buy'].includes(line['Transaction Type'])) {
    // console.log(`skipping ${line['Transaction Type']}`);
    continue;
  }

  console.log({ line });

  if (!line['Net Amount']) console.log('no net amount', line);
  const isBuy = line['Transaction Type'] === 'Bitcoin Buy';

  const netAmount = Number(
    line['Net Amount'].replace('$', '').replace(/,/g, '')
  );
  const asset = Number(line['Asset Amount']);

  const Funds = -netAmount;
  const Shares = isBuy ? asset : -asset;
  const Price = precision(Math.abs(divide(Funds, Shares)), 2);

  // console.log({ netAmount, asset, isBuy, Funds, Shares, Price });

  history.push({
    Time: new Date(line.Date).toISOString(),
    Price,
    Holding: '',
    Value: '',
    Funds,
    Shares,
  });
}

// write new history file
const finalData = [
  `Time\tPrice\tHolding\tValue\tFunds\tShares`,
  ...history.map(row => Object.values(row).join('\t')),
].join('\n');

// log.debug(data)
const finalFile = `${__dirname}/../data/history.cashapp.tsv`;
fs.writeFileSync(finalFile, finalData);
