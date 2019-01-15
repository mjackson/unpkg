import cors from 'cors';
import express from 'express';

import logging from '../middleware/logging';
import showStats from '../actions/showStats';

const app = express.Router();

app.use(logging);
app.use(cors());
app.use(showStats);

export default app;
