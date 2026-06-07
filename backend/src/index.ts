import dotenv from 'dotenv';
import { app } from './app';

dotenv.config();

const port = 3010;

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
