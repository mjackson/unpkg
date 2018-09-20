const https = require(process.env.NPM_REGISTRY_URL.indexOf("http:") !== 0
  ? "https"
  : "http");

const agent = new https.Agent({
  keepAlive: true
});

module.exports = agent;
