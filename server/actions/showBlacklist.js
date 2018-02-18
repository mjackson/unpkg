const BlacklistAPI = require("../BlacklistAPI");

function showBlacklist(req, res) {
  BlacklistAPI.getPackages().then(
    blacklist => {
      res.send({ blacklist });
    },
    error => {
      console.error(error);
      res.status(500).send({
        error: "Unable to fetch blacklist"
      });
    }
  );
}

module.exports = showBlacklist;
