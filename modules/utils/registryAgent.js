import http from 'http';
import https from 'https';

const agent = {
  'http:': new http.Agent({
    keepAlive: true
  }),
  'https:': new https.Agent({
    keepAlive: true
  }),
};

export default agent;
