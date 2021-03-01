const fs = require('fs');
const config = require('../config');
const history = fs.readFileSync(config.history_file).toString();
const rows = history.split('\n');
const headerRow = rows.slice(0, 1)[0];
const dataRows = rows.slice(1);
const headerCells = headerRow.split('\t');
const noHistory = !dataRows.length;
const textCols = ['Time', 'Profit', 'APY', 'ID'];
const tsvAsObj = (headers, cells) => {
  return headers.reduce((obj, nextKey, index) => {
    if (noHistory) {
      obj[nextKey] = nextKey === 'Time' ? new Date().toISOString() : 0;
      return obj;
    }
    obj[nextKey] = textCols.includes(nextKey)
      ? cells[index]
      : Number(cells[index]);
    return obj;
  }, {});
};
module.exports = {
  all: () => {
    return dataRows.map(row =>
      tsvAsObj(headerCells, row.replace(/,/g, '').split('\t'))
    );
  },
  first: () => {
    return tsvAsObj(
      headerCells,
      (dataRows[1] || '').replace(/,/g, '').split('\t')
    );
  },
  headerRow: headerRow,
  last: () => {
    return tsvAsObj(
      headerCells,
      noHistory
        ? null
        : dataRows[dataRows.length - 1].replace(/,/g, '').split('\t')
    );
  },
};
