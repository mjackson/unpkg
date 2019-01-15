import cors from 'cors';
import express from 'express';

import logging from '../middleware/logging';
import userToken from '../middleware/userToken';
import showAuth from '../actions/showAuth';

const app = express.Router();

app.use(logging);
app.use(cors());
app.use(userToken);
app.use(showAuth);

export default app;
