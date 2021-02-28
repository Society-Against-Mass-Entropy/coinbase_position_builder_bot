const fs = require('fs');
const config = require('../config');
module.exports = () => {
  const history = fs.readFileSync(config.history_file).toString();
  const historyLines = history.split('\n');
  const historyLast = historyLines[historyLines.length - 1];
  const historyHeaderLine = historyLines.slice(0, 1)[0];
  const headers = historyHeaderLine.split('\t');
  const noHistory = historyLines.length === 1;
  const data = historyLast.split('\t');
  const lastLog = headers.reduce((obj, nextKey, index) => {
    obj[nextKey] = noHistory
      ? 0
      : ['Time', 'Profit'].includes(nextKey)
      ? data[index]
      : Number(data[index]);
    return obj;
  }, {});
  if (!lastLog.Time) {
    lastLog.Time = new Date().toISOString();
    lastLog.Funds = 0;
    lastLog.Holding = 0;
    lastLog.Target = 0;
    lastLog.Realized = 0;
    lastLog.TotalInput = 0;
  }
  return lastLog;
};
