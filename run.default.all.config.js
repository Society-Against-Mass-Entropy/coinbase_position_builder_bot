/**
 * takes all the run.default.*.config.js files
 * and merges them into a single multi-app ecosystem file for PM2
 *
 * WARNING: this will run live, using the configs in run.default.*
 * Make sure they are what you want before running them.
 * You can test those configs using run.dry.all.config.js instead of this config!
 *
 * pm2 start run.default.all.config.js
 */

const fs = require("fs");
const files = fs
  .readdirSync(".")
  .filter(
    (f) =>
      f.includes("run.default") &&
      f.includes("config.js") &&
      f !== "run.default.all.config.js"
  );

const apps = [];
files.forEach((f) => {
  const config = require(`./${f}`).apps;
  apps.push(...config);
});

module.exports = {
  apps: apps,
};
