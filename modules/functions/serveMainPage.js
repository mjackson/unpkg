import express from 'express';

import serveMainPage from '../actions/serveMainPage';

const app = express();

app.disable('x-powered-by');
app.use(serveMainPage);

export default app;
