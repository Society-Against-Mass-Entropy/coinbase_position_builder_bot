/**
 * takes all the run.default.*.config.js files
 * and merges them into a single multi-app dry run test
 *
 * pm2 start run.dry.all.config.js
 */

const fs = require('fs');
const log = require('./lib/log');
const files = fs
  .readdirSync('.')
  .filter(
    f =>
      f.includes('run.default') &&
      f.includes('config.js') &&
      f !== 'run.default.all.config.js'
  );

log.debug({ files });

const apps = [];
files.forEach(f => {
  const config = require(`./${f}`).apps.map(a => {
    // add DRY RUN mode to each app config
    a.env.CPBB_DRY_RUN = true;
    a.name = `${a.name}_dryrun`;
    return a;
  });
  apps.push(...config);
});

log.debug(apps);

module.exports = {
  apps: apps,
};
