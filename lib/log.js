module.exports = {
  debug: process.env.VERBOSE === "true" ? console.log : () => { },
  error: function () {
    console.error("🚨", ...[].slice.call(arguments));
  },
  now: console.log,
  ok: function () {
    console.log("✅", ...[].slice.call(arguments));
  },
  zap: function () {
    console.log("⚡", ...[].slice.call(arguments));
  }
};
