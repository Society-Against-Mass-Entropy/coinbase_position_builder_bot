const verbose = process.env.VERBOSE_TEST === 'true';

const log = {
  out: [],
  err: [],
  warn: [],
};

// convert all console.log output to make it generically testable
global.console.log = (...args) => {
  const line = args
    .map(a => (typeof a === 'object' ? JSON.stringify(a) : a))
    .join(' ')
    .replace(
      /Position Builder Bot .+, http/,
      `Position Builder Bot [VERSION], http`
    )
    .replace(
      /[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}/g,
      '[UUID]'
    )
    // .replace(/\d{4}-\d{2}-\d{2}T[^\s]+\s/g, '[DATE] ')
    // .replace(/next run .+ \d{4}-\d{2}-\d{2}T.+/, 'next run on [DATE]')
    .replace(/\s+$/, '')
    .replace(
      /from template .+history\.TEST-USD\.sandbox\.tsv/,
      'from template ./data/history.TEST-USD.sandbox.tsv'
    )
    .replace(
      /from template .+maker\.orders\.TEST-USD\.sandbox\.json/,
      'from template ./data/maker.orders.TEST-USD.sandbox.json'
    );
  log.out.push(line);
  if (verbose) process.stdout.write('\n' + line);
};
global.console.warn = (...args) => {
  const line = args
    .map(a => (typeof a === 'object' ? JSON.stringify(a) : a))
    .join(' ');
  log.warn.push(line);
  if (verbose) process.stdout.write('\n' + line);
};
global.console.error = (...args) => {
  const line = args
    .map(a => (typeof a === 'object' ? JSON.stringify(a) : a))
    .join(' ');
  log.err.push(line);
  if (verbose) process.stderr.write('\n' + line);
};

module.exports = log;
