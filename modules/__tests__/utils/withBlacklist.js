const BlacklistAPI = require("../../BlacklistAPI");

function withBlacklist(blacklist, done) {
  Promise.all(blacklist.map(BlacklistAPI.addPackage)).then(done);
}

module.exports = withBlacklist;
