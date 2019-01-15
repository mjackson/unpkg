import express from 'express';
import cors from 'cors';

import userToken from '../middleware/userToken';
import showAuth from '../actions/showAuth';

const app = express.Router();

app.use(cors());
app.use(userToken);
app.use(showAuth);

export default app;
