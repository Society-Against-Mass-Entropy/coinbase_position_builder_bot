/**
 * runs through a collection of settings and tests which is the best
 * using the highest final liquid value as the metric for best case
 * usage: node get_best_settings.js
 */
// const util = require('util');
// const exec = util.promisify(require('child_process').exec);
const { spawnSync } = require('child_process');

const jest = `./node_modules/jest/bin/jest.js`;
const jestSpawnArgs = [
  `--testPathIgnorePatterns=/node_modules/`,
  `--testTimeout=12000000`,
];
// const jestArgs = `--testPathIgnorePatterns=/node_modules/ --testTimeout=12000000`;

const fs = require('fs');
const { add, subtract, divide } = require('../lib/math');

const startYearFirst = 2016;
const startYearLast = 2021;
const startMonth = '01';

const configs = [
  {
    CPBB_VOL: 240,
    CPBB_APY: 100,
    CPBB_RATE_INTERVAL: 'daily',
    actions: '1/day',
  },
  {
    CPBB_VOL: 120,
    CPBB_APY: 100,
    CPBB_RATE_INTERVAL: 'hourly',
    CPBB_RATE_INTERVAL_MOD: 12,
    actions: '2/day',
  },
  {
    CPBB_VOL: 60,
    CPBB_APY: 100,
    CPBB_RATE_INTERVAL: 'hourly',
    CPBB_RATE_INTERVAL_MOD: 6,
    actions: '4/day',
  },
  {
    CPBB_VOL: 20,
    CPBB_APY: 100,
    CPBB_RATE_INTERVAL: 'hourly',
    CPBB_RATE_INTERVAL_MOD: 2,
    actions: '12/day',
  },
  {
    CPBB_VOL: 10,
    CPBB_APY: 100,
    CPBB_RATE_INTERVAL: 'hourly',
    actions: '24/day',
    // },{
    //   CPBB_VOL: 100,
    //   CPBB_APY: 100,
    //   CPBB_REBUY: '.0001@3,.0005@6,.001@9,.005@12,.01@15,.05@20,.1@25,.5@30,1@50',
    //   CPBB_RESELL: '.0001@3,.0005@6,.001@9,.005@12,.01@15,.05@20,.1@25,.5@30,1@50',
    //   CPBB_REBUY_MAX: 100,
    //   CPBB_RESELL_MAX: 100,
    //   CPBB_REBUY_CANCEL: 259200, // 3 days
    //   CPBB_RESELL_CANCEL: 259200,
    //   CPBB_REBUY_REBUILD: 10,
    //   CPBB_RESELL_REBUILD: 10
  },
];
(async () => {
  // loop through multiple parameters
  // run jest on ../test/backtest.test using shell exec
  // read history.TEST-USD.sandbox.tsv.archive.tsv
  // get the last value for `Liquid` column

  console.log(
    `Start\tFunds\tActions\tAPY\tRebuy Max\tRebuy Conf\tResell Max\tResell Conf\tInput\tOutput\tGain\tHolding\tBasis`
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

      // const task = spawn(jest, jestSpawnArgs, processConfig);
      spawnSync(jest, jestSpawnArgs, processConfig);
      // for await (const data of task.stdout) {
      //   console.log(data);
      // }
      // await exec(`${jest} ${jestArgs} -- test/backtest.test.js`, processConfig);
      // console.log(stdout, stderr);
      let dataLog = fs
        .readFileSync(
          `${__dirname}/../data/history.TEST-USD.sandbox.tsv.archive.tsv`
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
        }\t${conf.CPBB_REBUY || ''}\t${conf.CPBB_RESELL_MAX || ''}\t${
          conf.CPBB_RESELL || ''
        }\t${totalInput.toFixed(2)}\t${realized.toFixed(
          2
        )}\t${liquidGain.toFixed(2)}\t${holding}\t${basis.toFixed(2)}`
      );
    }
  }
})();
