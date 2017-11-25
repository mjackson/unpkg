function getFileType(stats) {
  if (stats.isFile()) return "file"
  if (stats.isDirectory()) return "directory"
  if (stats.isBlockDevice()) return "blockDevice"
  if (stats.isCharacterDevice()) return "characterDevice"
  if (stats.isSymbolicLink()) return "symlink"
  if (stats.isSocket()) return "socket"
  if (stats.isFIFO()) return "fifo"
  return "unknown"
}

module.exports = getFileType
