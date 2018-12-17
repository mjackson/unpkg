const mime = require('mime');

mime.define({
  'text/plain': [
    'authors',
    'changes',
    'license',
    'makefile',
    'patents',
    'readme',
    'ts',
    'flow'
  ]
});

const textFiles = /\/?(\.[a-z]*rc|\.git[a-z]*|\.[a-z]*ignore|\.lock)$/i;

function getContentType(file) {
  return textFiles.test(file) ? 'text/plain' : mime.lookup(file);
}

module.exports = getContentType;
