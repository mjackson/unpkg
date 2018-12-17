function bufferStream(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];

    stream
      .on('error', reject)
      .on('data', chunk => chunks.push(chunk))
      .on('end', () => resolve(Buffer.concat(chunks)));
  });
}

module.exports = bufferStream;
