const fs = require('fs');

module.exports = name => {
  const filepath = `${__dirname}/../data/output.${name}.log`;
  return fs.existsSync(filepath)
    ? fs.readFileSync(filepath).toString().split('\n')
    : [];
};
