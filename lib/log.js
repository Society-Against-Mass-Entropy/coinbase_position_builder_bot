module.exports = {
  debug: process.env.VERBOSE ? console.log : () => { },
  error: function () {
    console.error("🚨", ...[].slice.call(arguments));
  },
  now: console.log,
  ok: function () {
    console.log("✅", ...[].slice.call(arguments));
  },
};
