/**
 * playing with the coinbase api to get a handle on supply and demand
 *
 */
const log = require("../lib/log");
const request = require("../coinbase/cb.request");
const { add, multiply } = require("../lib/math");
const sleep = ms => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

const reduceAltBTC = orders =>
  orders
    .map(a => multiply(a[0], a[1]))
    .reduce((sum, o) => {
      return add(sum, o);
    }, 0);

const reduceFiatBTC = orders =>
  orders.reduce((sum, o) => {
    return add(sum, o[1]);
  }, 0);

const alts = [
  "AAVE",
  "ATOM",
  "BAL",
  "BAND",
  "BCH",
  "BNT",
  "CGLD",
  "COMP",
  "DASH",
  "EOS",
  "ETC",
  "ETH",
  "FIL",
  "GRT",
  "KNC",
  "LTC",
  "MKR",
  "NMR",
  "NU",
  "OMG",
  "REN",
  "REP",
  "SNX",
  "UMA",
  "WBTC",
  "XLM",
  "XTZ",
  "YFI",
  "ZEC",
  "ZRX",
];
const fiat = ["USD", "USDC", "GBP", "EUR"];

(async () => {
  let supply = 0;
  let demand = 0;
  let line = "";

  for (let i = 0; i < fiat.length; i++) {
    const f = fiat[i];
    const { json } = await request({
      requestPath: `/products/BTC-${f}/book?level=3`,
      method: "GET",
    });
    const btcdemand = reduceFiatBTC(json.bids);
    const btcsupply = reduceFiatBTC(json.asks);
    supply = add(supply, btcsupply);
    demand = add(demand, btcdemand);
    line += `\n${f}\t${btcsupply.toFixed(0)}\t${btcdemand.toFixed(0)}`;
    await sleep(1000);
  }
  for (let i = 0; i < alts.length; i++) {
    const alt = alts[i];
    const { json } = await request({
      requestPath: `/products/${alt}-BTC/book?level=3`,
      method: "GET",
    });
    const btcdemand = reduceAltBTC(json.asks);
    const btcsupply = reduceAltBTC(json.bids);
    // if (alt === 'XLM') log.debug({ btcdemand, btcsupply }, orders.asks[0], orders.bids[0])
    supply = add(supply, btcsupply);
    demand = add(demand, btcdemand);
    line += `\n${alt}\t${btcsupply.toFixed(0)}\t${btcdemand.toFixed(0)}`;
    await sleep(1000);
  }

  log.ok(
    `Currency\tBTC Supply\tBTC Demand\n\t${supply.toFixed(0)}\t${demand.toFixed(
      0
    )}${line}`
  );
})();
