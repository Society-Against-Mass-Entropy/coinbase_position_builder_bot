/**
 * runs through a collection of settings and tests which is the best
 * using the highest final liquid value as the metric for best case
 * usage: node get_best_settings.js
 */
// const util = require('util');
// const exec = util.promisify(require('child_process').exec);
// const { spawnSync } = require('child_process');
const { spawn } = require('child_process');
// const spawn = require('await-spawn');

const jest = `./node_modules/jest/bin/jest.js`;
const jestSpawnArgs = [
  `--testPathIgnorePatterns=/node_modules/`,
  `--testTimeout=12000000`,
  `--`,
  `test/backtest.test.js`,
];
// const jestArgs = `--testPathIgnorePatterns=/node_modules/ --testTimeout=12000000`;

const fs = require('fs');
// const { sleep } = require('../config');
const { add, subtract, divide } = require('../lib/math');

const startYearFirst = 2020;
const startYearLast = 2020;
const startMonth = '06';

const configs = require('../test/data/config.settings.js');

(async () => {
  // loop through multiple parameters
  // run jest on ../test/backtest.test using shell exec
  // read history.TEST-USD.sandbox.tsv.archive.tsv
  // get the last value for `Liquid` column

  console.log(
    `Start\tFunds\tActions\tAPY\tRebuy Max\tRebuy Conf\tRebuy Rebuild\tResell Max\tResell Conf\tResell Rebuild\tLimit Cancel\tInput\tOutput\tGain\tHolding\tBasis\tName`
  );
  for (let year = startYearFirst; year <= startYearLast; year++) {
    let start = `${year}-${startMonth}-01`;
    for (let i in configs) {
      let conf = configs[i];
      let processConfig = {
        cwd: `${__dirname}/../`, // project root
        env: {
          ...process.env,
          ...conf,
          // PATH: `${process.env.PATH}:/usr/local/bin`,
          CPBB_BRUT_FORCE: true,
          CPBB_TEST_START: start,
          // VERBOSE_TEST: 'true',
        },
      };

      //const result = await spawn(jest, jestSpawnArgs, processConfig);
      //console.log(result.toString());
      // spawnSync(jest, jestSpawnArgs, processConfig);
      // console.log(`kicking off test ${start} ${i}`);
      const task = spawn(jest, jestSpawnArgs, processConfig);
      // eslint-disable-next-line no-unused-vars
      for await (const data of task.stdout) {
        // console.log(data.toString());
      }
      // await exec(`${jest} ${jestArgs} -- test/backtest.test.js`, processConfig);
      // console.log(stdout, stderr);
      let dataLog = fs
        .readFileSync(
          `${__dirname}/../data/history.TEST-USD.sandbox.tsv.${
            conf.CPBB_TEST_NAME || 'archive'
          }.tsv`
        )
        .toString()
        .split('\n');
      let lastLog = dataLog[dataLog.length - 1].split('\t');
      let shares = lastLog[5];
      let holding = lastLog[2];
      let liquidGain = Number(lastLog[14]);
      let totalInput = Number(lastLog[8]);
      let realized = Number(lastLog[12]);
      let basis = divide(subtract(totalInput, realized), add(holding, shares));
      console.log(
        `${start}\t${conf.CPBB_VOL}\t${conf.actions}\t${conf.CPBB_APY}%\t${
          conf.CPBB_REBUY_MAX || ''
        }\t${conf.CPBB_REBUY || ''}\t${conf.CPBB_REBUY_REBUILD || ''}\t${
          conf.CPBB_RESELL_MAX || ''
        }\t${conf.CPBB_RESELL || ''}\t${conf.CPBB_RESELL_REBUILD || ''}\t${
          conf.CPBB_RESELL_CANCEL
            ? `${Math.floor(conf.CPBB_RESELL_CANCEL / 60 / 24)} days`
            : ''
        }\t${totalInput.toFixed(2)}\t${realized.toFixed(
          2
        )}\t${liquidGain.toFixed(2)}\t${holding}\t${basis.toFixed(2)}\t${
          conf.CPBB_TEST_NAME
        }`
      );
    }
  }
})();
