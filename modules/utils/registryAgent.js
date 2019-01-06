import https from 'https';

const agent = new https.Agent({
  keepAlive: true
});

export default agent;
