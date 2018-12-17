const data = require('../../utils/data');

function closeDatabase() {
  data.quit();
}

module.exports = closeDatabase;
