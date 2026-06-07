import express from 'express';
import cors from 'cors';
import candidateRoutes from './routes/candidateRoutes';
import { errorHandler } from './middleware/errorHandler';

export const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => {
  res.send('Hola LTI!');
});

app.use('/candidates', candidateRoutes);

app.use(errorHandler);
