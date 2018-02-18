const mime = require("mime");

mime.define({
  "text/plain": [
    "authors",
    "changes",
    "license",
    "makefile",
    "patents",
    "readme",
    "ts",
    "flow"
  ]
});

const TextFiles = /\/?(\.[a-z]*rc|\.git[a-z]*|\.[a-z]*ignore)$/i;

function getFileContentType(file) {
  return TextFiles.test(file) ? "text/plain" : mime.lookup(file);
}

module.exports = getFileContentType;
