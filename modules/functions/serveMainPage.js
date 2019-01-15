import express from 'express';

import serveMainPage from '../actions/serveMainPage';

const app = express.Router();

app.use(serveMainPage);

export default app;
