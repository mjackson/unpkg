export default function bufferStream(stream) {
  return new Promise((accept, reject) => {
    const chunks = [];

    stream
      .on('error', reject)
      .on('data', chunk => chunks.push(chunk))
      .on('end', () => accept(Buffer.concat(chunks)));
  });
}
