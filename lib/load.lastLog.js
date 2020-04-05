const fs = require('fs')
const config = require('../config')
const logTable = require('./log.table')
module.exports = () => {
  const history = fs.readFileSync(config.history_file).toString()
  const historyLines = history.split('\n')
  const historyLast = historyLines[historyLines.length - 1]
  const historyHeaderLine = historyLines.slice(0, 1)[0]
  const headers = historyHeaderLine.split('\t')
  const noHistory = historyLines.length === 1
  const data = historyLast.split('\t')
  console.log('📜 history:')
  logTable(
    ['⚡',...headers],
    noHistory ? null : historyLines.map((l,i)=>{
      if(i===0) return
      const cells = l.split('\t')
      return [Number(cells[4]) > 0 ? '💸' : '🤑',...cells]
    }).filter(i=>i))
  return headers.reduce((obj, nextKey, index) => {
    obj[nextKey] = noHistory ? 0 : (nextKey === 'Time' ? data[index] : Number(data[index]))
    return obj
  }, {})
}
