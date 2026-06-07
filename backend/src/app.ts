import express from 'express';
import cors from 'cors';
import candidateRoutes from './routes/candidateRoutes';
import { errorHandler } from './middleware/errorHandler';

export const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
app.use(express.json({ limit: '1mb' }));

app.get('/', (_req, res) => {
  res.send('Hola LTI!');
});

app.use('/candidates', candidateRoutes);

app.use(errorHandler);
