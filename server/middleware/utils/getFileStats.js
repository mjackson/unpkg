const fs = require("fs")

function getFileStats(file) {
  return new Promise((resolve, reject) => {
    fs.lstat(file, (error, stats) => {
      if (error) {
        reject(error)
      } else {
        resolve(stats)
      }
    })
  })
}

module.exports = getFileStats
