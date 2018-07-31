const BlacklistAPI = require("../../BlacklistAPI");

function withBlacklist(blacklist, callback) {
  return Promise.all(blacklist.map(BlacklistAPI.addPackage)).then(callback);
}

module.exports = withBlacklist;
