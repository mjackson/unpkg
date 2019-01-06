import path from 'path';
import etag from 'etag';

import getContentTypeHeader from '../utils/getContentTypeHeader';

export default function serveStaticFile(req, res) {
  const tags = ['file'];

  const ext = path.extname(req.entry.name).substr(1);
  if (ext) {
    tags.push(`${ext}-file`);
  }

  res
    .set({
      'Content-Length': req.entry.size,
      'Content-Type': getContentTypeHeader(req.entry.contentType),
      'Cache-Control': 'public, max-age=31536000, immutable', // 1 year
      'Last-Modified': req.entry.lastModified,
      ETag: etag(req.entry.content),
      'Cache-Tag': tags.join(', ')
    })
    .send(req.entry.content);
}
