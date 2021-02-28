module.exports = (num, digits) => {
  return Number(Number(num).toFixed(digits || 8));
};
