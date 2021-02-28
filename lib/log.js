const silentFn = process.env.CPBB_SILENT === 'true' ? () => {} : false;
module.exports = {
  bot:
    silentFn ||
    function () {
      console.log('🤖', ...[].slice.call(arguments));
    },
  debug: process.env.VERBOSE === 'true' ? console.log : () => {},
  error:
    silentFn ||
    function () {
      console.error('🚨', ...[].slice.call(arguments));
    },
  now: silentFn || console.log,
  ok:
    silentFn ||
    function () {
      console.log('✅', ...[].slice.call(arguments));
    },
  zap:
    silentFn ||
    function () {
      console.log('⚡', ...[].slice.call(arguments));
    },
};
