const mime = require('mime')

mime.define({
  'text/plain': [
    'license',
    'readme',
    'changes',
    'authors',
    'makefile',
    'ts',
    'flow'
  ]
})

const TextFiles = /\/?(\.[a-z]*rc|\.git[a-z]*|\.[a-z]*ignore)$/i

function getFileContentType(file) {
  return TextFiles.test(file) ? 'text/plain' : mime.lookup(file)
}

module.exports = getFileContentType
