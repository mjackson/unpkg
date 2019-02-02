const util = require('util');
const chalk = require('chalk');

function die(why) {
  const message = typeof why === 'string' ? why : util.inspect(why);
  console.error(chalk.red(message));
  process.exit(1);
}

module.exports = {
  die
};
