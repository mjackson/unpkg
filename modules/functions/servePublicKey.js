import cors from 'cors';
import express from 'express';

import logging from '../middleware/logging';
import showPublicKey from '../actions/showPublicKey';

const app = express.Router();

app.use(logging);
app.use(cors());
app.use(showPublicKey);

export default app;
