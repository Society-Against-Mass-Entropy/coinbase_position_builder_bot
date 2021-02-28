/**
 * takes all the run.default.*.config.js files
 * and merges them into a single multi-app dry run test
 *
 * ALSO updates the trading frequency to every minute
 *
 * (this gives us a rapid test)
 *
 * pm2 start run.dry.all.config.js
 */

const fs = require('fs');
const files = fs
  .readdirSync('.')
  .filter(
    f =>
      f.includes('run.default') &&
      f.includes('config.js') &&
      f !== 'run.default.all.config.js'
  );

const apps = [];
files.forEach(f => {
  const config = require(`./${f}`).apps.map(a => {
    // add DRY RUN mode to each app config
    a.env.CPBB_DRY_RUN = true;
    a.env.CPBB_FREQ = '* * * * *';
    a.name = `${a.name}_dryrun`;
    return a;
  });
  apps.push(...config);
});

module.exports = {
  apps: apps,
};
