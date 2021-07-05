/**
 * runs through a collection of settings and tests which is the best
 * using the highest final liquid value as the metric for best case
 * usage: node get_best_settings.js
 */
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const jest = `./node_modules/jest/bin/jest.js`;
const jestArgs = `--testPathIgnorePatterns=/node_modules/`;

const fs = require('fs');
const { add, subtract, divide } = require('../lib/math');

const startYearFirst = 2020;
const startYearLast = 2020;
const startMonth = '06';
// const CPBB_APY = [25, 50, 75, 100, 150, 200];
const CPBB_VOL = 28;
const apy = [100];
const rebuy = ['', '.0001@3,.0001@6,.0001@9,.0009@12'];
const resell = ['', '.0001@3,.0001@6,.0001@9,.0009@12'];
const rebuy_max = [0, 14];
const resell_max = [0, 14];
// 100 year limit cancel (never)
const CPBB_REBUY_CANCEL = 52560000;
const CPBB_RESELL_CANCEL = 52560000;
const CPBB_REBUY_REBUILD = 52560000;
const CPBB_RESELL_REBUILD = 52560000;
(async () => {
  // loop through multiple parameters
  // run jest on ../test/backtest.test using shell exec
  // read history.TEST-USD.sandbox.tsv.archive.tsv
  // get the last value for `Liquid` column

  console.log(
    `Start\tFunds\tAPY\tRebuy Max\tRebuy Conf\tResell Max\tResell Conf\tInput\tOutput\tGain\tHolding\tBasis`
  );
  for (let year = startYearFirst; year <= startYearLast; year++) {
    let start = `${year}-${startMonth}-01`;
    for (let i in apy) {
      let CPBB_APY = apy[i];
      for (let j in rebuy) {
        let CPBB_REBUY = rebuy[j];
        let CPBB_REBUY_MAX = rebuy_max[j];
        for (let k in resell) {
          let CPBB_RESELL = resell[k];
          let CPBB_RESELL_MAX = resell_max[k];
          await exec(`${jest} ${jestArgs} -- test/backtest.test.js`, {
            cwd: `${__dirname}/../`, // project root
            env: {
              ...process.env,
              // PATH: `${process.env.PATH}:/usr/local/bin`,
              CPBB_VOL,
              CPBB_REBUY,
              CPBB_REBUY_MAX,
              CPBB_REBUY_CANCEL,
              CPBB_REBUY_REBUILD,
              CPBB_RESELL,
              CPBB_RESELL_MAX,
              CPBB_RESELL_CANCEL,
              CPBB_RESELL_REBUILD,
              CPBB_BRUT_FORCE: true,
              CPBB_TEST_START: start,
              CPBB_APY,
              CPBB_RATE_INTERVAL: 'hourly',
              CPBB_RATE_INTERVAL_MOD: 2,
            },
          });
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
          let basis = divide(
            subtract(totalInput, realized),
            add(holding, shares)
          );
          console.log(
            `${start}\t${CPBB_VOL}\t${CPBB_APY}%\t${CPBB_REBUY_MAX}\t${CPBB_REBUY}\t${CPBB_RESELL_MAX}\t${CPBB_RESELL}\t${totalInput.toFixed(
              2
            )}\t${realized.toFixed(2)}\t${liquidGain.toFixed(
              2
            )}\t${holding}\t${basis.toFixed(2)}`
          );
        }
      }
    }
  }
})();
