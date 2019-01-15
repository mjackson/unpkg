import express from 'express';
import cors from 'cors';

import showPublicKey from '../actions/showPublicKey';

const app = express.Router();

app.use(cors());
app.use(showPublicKey);

export default app;
