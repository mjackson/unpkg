const fs = require("fs")
const path = require("path")
const SRIToolbox = require("sri-toolbox")
const getFileContentType = require("./getFileContentType")
const getFileStats = require("./getFileStats")
const getFileType = require("./getFileType")

function getEntries(dir, file, maximumDepth) {
  return new Promise((resolve, reject) => {
    fs.readdir(path.join(dir, file), function(error, files) {
      if (error) {
        reject(error)
      } else {
        resolve(
          Promise.all(files.map(f => getFileStats(path.join(dir, file, f)))).then(statsArray => {
            return Promise.all(
              statsArray.map((stats, index) =>
                getMetadataRecursive(dir, path.join(file, files[index]), stats, maximumDepth - 1)
              )
            )
          })
        )
      }
    })
  })
}

function formatTime(time) {
  return new Date(time).toISOString()
}

function getIntegrity(file) {
  return new Promise((resolve, reject) => {
    fs.readFile(file, function(error, data) {
      if (error) {
        reject(error)
      } else {
        resolve(SRIToolbox.generate({ algorithms: ["sha384"] }, data))
      }
    })
  })
}

function getMetadataRecursive(dir, file, stats, maximumDepth) {
  const metadata = {
    lastModified: formatTime(stats.mtime),
    contentType: getFileContentType(file),
    path: file,
    size: stats.size,
    type: getFileType(stats)
  }

  if (stats.isFile()) {
    return getIntegrity(path.join(dir, file)).then(integrity => {
      metadata.integrity = integrity
      return metadata
    })
  }

  if (!stats.isDirectory() || maximumDepth === 0) return Promise.resolve(metadata)

  return getEntries(dir, file, maximumDepth).then(files => {
    metadata.files = files
    return metadata
  })
}

function getMetadata(baseDir, path, stats, maximumDepth, callback) {
  getMetadataRecursive(baseDir, path, stats, maximumDepth).then(function(metadata) {
    callback(null, metadata)
  }, callback)
}

module.exports = getMetadata
