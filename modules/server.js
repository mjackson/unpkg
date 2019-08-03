if (process.env.GAE_ENV === 'standard') {
  require('@google-cloud/trace-agent').start();
}

import createServer from './createServer.js';

const server = createServer();
const port = process.env.PORT || '8080';

server.listen(port, () => {
  console.log('Server listening on port %s, Ctrl+C to quit', port);
});
