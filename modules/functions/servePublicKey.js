import express from 'express';
import cors from 'cors';

import showPublicKey from '../actions/showPublicKey';

const app = express();

app.disable('x-powered-by');

app.use(cors());
app.use(showPublicKey);

export default app;
