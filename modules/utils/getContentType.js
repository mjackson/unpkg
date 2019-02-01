import mime from 'mime';

mime.define(
  {
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
  },
  /* force */ true
);

const textFiles = /\/?(\.[a-z]*rc|\.git[a-z]*|\.[a-z]*ignore|\.lock)$/i;

export default function getContentType(file) {
  return textFiles.test(file) ? 'text/plain' : mime.getType(file);
}
