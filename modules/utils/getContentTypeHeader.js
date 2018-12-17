function getContentTypeHeader(type) {
  return type === 'application/javascript' ? type + '; charset=utf-8' : type;
}

module.exports = getContentTypeHeader;
