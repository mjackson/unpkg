import express from 'express';

import logging from '../middleware/logging';
import serveMainPage from '../actions/serveMainPage';

const app = express.Router();

app.use(logging);
app.use(serveMainPage);

export default app;
