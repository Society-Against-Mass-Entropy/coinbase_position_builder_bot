const fs = require('fs');

module.exports = name =>
  fs
    .readFileSync(`${__dirname}/../data/output.${name}.log`)
    .toString()
    .split('\n');
