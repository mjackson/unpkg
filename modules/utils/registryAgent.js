const serverConfig = require("../serverConfig");
const https = require(serverConfig.registryURL.indexOf("http:") !== 0 ? "https" : "http");

const agent = new https.Agent({
  keepAlive: true
});

module.exports = agent;
