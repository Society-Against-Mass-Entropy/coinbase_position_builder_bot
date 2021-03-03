// ordered list of the price fluctuations as the engine runs

let index = 0;
const prices = [
  '50000.00', // get ticker, trigger buy
  '50000.00', // post order response
  '200000.00', // get ticker (emulate big price jump), trigger sell
  '200000.00', // post order response
  '51000.00',
  '51000.00',
];

module.exports = () => {
  if (index > prices.length - 1) index = 0;
  const price = prices[index];
  index++;
  return price;
};
