const fs = require('fs')
const mime = require('mime')

mime.define({
  'text/plain': [
    'license',
    'readme',
    'changes',
    'authors',
    'makefile',
    'ts'
  ]
})

const TextFiles = /\/?(\.[a-z]*rc|\.git[a-z]*|\.[a-z]*ignore)$/i

const getContentType = (file) =>
  TextFiles.test(file) ? 'text/plain' : mime.lookup(file)

const getStats = (file) =>
  new Promise((resolve, reject) => {
    fs.lstat(file, (error, stats) => {
      if (error) {
        reject(error)
      } else {
        resolve(stats)
      }
    })
  })

const getFileType = (stats) => {
  if (stats.isFile()) return 'file'
  if (stats.isDirectory()) return 'directory'
  if (stats.isBlockDevice()) return 'blockDevice'
  if (stats.isCharacterDevice()) return 'characterDevice'
  if (stats.isSymbolicLink()) return 'symlink'
  if (stats.isSocket()) return 'socket'
  if (stats.isFIFO()) return 'fifo'
  return 'unknown'
}

module.exports = {
  getContentType,
  getStats,
  getFileType
}
