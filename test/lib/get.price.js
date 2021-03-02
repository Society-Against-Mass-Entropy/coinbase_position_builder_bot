// ordered list of the price fluctuations as the engine runs

let index = 0;
const prices = ['50000.00', '51000.00', '61000.00', '51000.00'];

module.exports = () => {
  if (index > prices.length - 1) index = 0;
  const uuid = prices[index];
  index++;
  return uuid;
};
