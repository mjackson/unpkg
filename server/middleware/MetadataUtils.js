const fs = require('fs')
const path = require('path')
const { getContentType, getStats, getFileType } = require('./FileUtils')

function getEntries(dir, file, maximumDepth) {
  return new Promise((resolve, reject) => {
    fs.readdir(path.join(dir, file), (error, files) => {
      if (error) {
        reject(error)
      } else {
        resolve(
          Promise.all(
            files.map(function (f) {
              return getStats(path.join(dir, file, f))
            })
          ).then(function (statsArray) {
            return Promise.all(statsArray.map(function (stats, index) {
              return getMetadata(dir, path.join(file, files[index]), stats, maximumDepth - 1)
            }))
          })
        )
      }
    })
  })
}

function formatTime(time) {
  return new Date(time).toISOString()
}

function getMetadata(dir, file, stats, maximumDepth) {
  const metadata = {
    lastModified: formatTime(stats.mtime),
    contentType: getContentType(file),
    path: file,
    size: stats.size,
    type: getFileType(stats)
  }

  if (!stats.isDirectory() || maximumDepth === 0)
    return Promise.resolve(metadata)

  return getEntries(dir, file, maximumDepth).then(function (files) {
    metadata.files = files
    return metadata
  })
}

function generateMetadata(baseDir, path, stats, maximumDepth, callback) {
  return getMetadata(baseDir, path, stats, maximumDepth).then(function (metadata) {
    callback(null, metadata)
  }, callback)
}

module.exports = {
  get: generateMetadata
}
