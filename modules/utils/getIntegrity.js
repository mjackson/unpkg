const SRIToolbox = require('sri-toolbox');

function getIntegrity(data) {
  return SRIToolbox.generate({ algorithms: ['sha384'] }, data);
}

module.exports = getIntegrity;
