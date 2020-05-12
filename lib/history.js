const fs = require("fs");
const config = require("../config");
const logTable = require("./log.table");
const history = fs.readFileSync(config.history_file).toString();
const rows = history.split("\n");
const headerRow = rows.slice(0, 1)[0];
const dataRows = rows.slice(1);
const headerCells = headerRow.split("\t");
const noHistory = !dataRows.length;
const textCols = ["Time", "Profit", "APY"];
const tsvAsObj = (headers, cells) => {
  return headers.reduce((obj, nextKey, index) => {
    if (noHistory) {
      obj[nextKey] = 0;
      return obj;
    }
    obj[nextKey] = textCols.includes(nextKey)
      ? cells[index]
      : Number(cells[index]);
    return obj;
  }, {});
};
const logData = (rows) => {
  logTable(
    ["⚡", ...headerCells],
    noHistory
      ? null
      : rows
          .map((l, i) => {
            if (i === 0) return;
            const cells = l.split("\t");
            return [Number(cells[4]) > 0 ? "💸" : "🤑", ...cells];
          })
          .filter((i) => i)
  );
};
module.exports = {
  all: () => {
    return dataRows.map((row) => tsvAsObj(headerCells, row.split("\t")));
  },
  first: () => {
    return tsvAsObj(headerCells, (dataRows[1] || "").split("\t"));
  },
  headerRow: headerRow,
  last: () => {
    return tsvAsObj(
      headerCells,
      noHistory ? null : dataRows[dataRows.length - 1].split("\t")
    );
  },
  log: () => {
    console.log("📜 History:");
    logData(dataRows);
  },
  logRecent: (count) => {
    console.log("📜 Recent History:");
    logData(dataRows.slice(dataRows.length - count));
  },
};
