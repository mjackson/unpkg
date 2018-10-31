const cache = require('../../utils/cache');
const data = require('../../utils/data');

function closeDatabase() {
  cache.quit();
  data.quit();
}

module.exports = closeDatabase;
