const fs = require("fs");
const path = require("path");
const getFileStats = require("./getFileStats");

function getEntries(dir) {
  return new Promise((resolve, reject) => {
    fs.readdir(dir, function(error, files) {
      if (error) {
        reject(error);
      } else {
        resolve(
          Promise.all(
            files.map(file => getFileStats(path.join(dir, file)))
          ).then(statsArray => {
            return statsArray.map((stats, index) => {
              return { file: files[index], stats };
            });
          })
        );
      }
    });
  });
}

module.exports = getEntries;
