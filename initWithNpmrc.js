const fs = require('fs');

try {
  const npmrc = fs.readFileSync('.npmrc', 'utf8');
  console.log(".npmrc found, using custom registry")

  process.env.REGISTRY_URL = npmrc.match(/registry[\s]*=[\s]*(.*)/)[1];
  process.env.REGISTRY_AUTH = npmrc.match(/_auth[\s]*=[\s]*(.*)/)[1];
} catch (e) {
  console.log(".npmrc not found, using default env config for choosing the registry");
}

require('./server');
