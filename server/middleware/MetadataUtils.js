const fs = require('fs')
const { join: joinPaths } = require('path')
const { getContentType, getStats, getFileType } = require('./FileUtils')

const getEntries = (baseDir, path, maximumDepth) =>
  new Promise((resolve, reject) => {
    fs.readdir(joinPaths(baseDir, path), (error, files) => {
      if (error) {
        reject(error)
      } else {
        resolve(
          Promise.all(
            files.map(f => getStats(joinPaths(baseDir, path, f)))
          ).then(
            statsArray => Promise.all(statsArray.map(
              (stats, index) => getMetadata(baseDir, joinPaths(path, files[index]), stats, maximumDepth - 1)
            ))
          )
        )
      }
    })
  })

const formatTime = (time) =>
  new Date(time).toISOString()

const getMetadata = (baseDir, path, stats, maximumDepth) => {
  const metadata = {
    path,
    lastModified: formatTime(stats.mtime),
    contentType: getContentType(path),
    size: stats.size,
    type: getFileType(stats)
  }

  if (!stats.isDirectory() || maximumDepth === 0)
    return Promise.resolve(metadata)

  return getEntries(baseDir, path, maximumDepth).then(files => {
    metadata.files = files
    return metadata
  })
}

const generateMetadata = (baseDir, path, stats, maximumDepth, callback) =>
  getMetadata(baseDir, path, stats, maximumDepth)
    .then(metadata => callback(null, metadata), callback)

module.exports = {
  generateMetadata
}
