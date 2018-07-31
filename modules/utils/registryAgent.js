const https = require("https");

const agent = new https.Agent({
  keepAlive: true
});

module.exports = agent;
