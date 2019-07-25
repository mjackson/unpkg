export default function createDataURI(contentType, content) {
  return `data:${contentType};base64,${content.toString('base64')}`;
}
