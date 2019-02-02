const fetch = require('isomorphic-fetch');

function getMetadata(packageName, version) {
  return fetch(`https://unpkg.com/${packageName}@${version}/?meta`, {
    method: 'GET'
  }).then(res => res.json());
}

function collectFiles(directory) {
  return directory.files.reduce((memo, file) => {
    return memo.concat(file.type === 'directory' ? collectFiles(file) : file);
  }, []);
}

function getFiles(packageName, version) {
  return getMetadata(packageName, version).then(collectFiles);
}

module.exports = {
  getMetadata,
  getFiles
};
