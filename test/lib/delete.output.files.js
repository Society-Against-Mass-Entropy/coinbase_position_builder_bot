const fs = require('fs');

module.exports = purge => {
  const historyFile = `${__dirname}/../../data/history.${process.env.CPBB_TICKER}-${process.env.CPBB_CURRENCY}.sandbox.tsv`;
  const ordersFile = `${__dirname}/../../data/maker.orders.${process.env.CPBB_TICKER}-${process.env.CPBB_CURRENCY}.sandbox.json`;
  if (fs.existsSync(historyFile))
    purge
      ? fs.unlinkSync(historyFile)
      : fs.renameSync(
          historyFile,
          historyFile + `.${process.env.CPBB_TEST_NAME || 'archive'}.tsv`
        );
  if (fs.existsSync(ordersFile)) fs.unlinkSync(ordersFile);
};
