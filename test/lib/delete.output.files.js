const fs = require('fs');

module.exports = () => {
  const historyFile = `${__dirname}/../../data/history.${process.env.CPBB_TICKER}-${process.env.CPBB_CURRENCY}.sandbox.tsv`;
  const ordersFile = `${__dirname}/../../data/maker.orders.${process.env.CPBB_TICKER}-${process.env.CPBB_CURRENCY}.sandbox.json`;
  if (fs.existsSync(historyFile)) fs.unlinkSync(historyFile);
  if (fs.existsSync(ordersFile)) fs.unlinkSync(ordersFile);
};
