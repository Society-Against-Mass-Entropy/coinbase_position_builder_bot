module.exports = (num, digits) => {
  return Number(num.toFixed(digits || 8));
};
