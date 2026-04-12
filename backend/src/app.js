import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import accountRoutes from './routes/accountRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import { pingDatabase } from './config/db.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'API de banca digital funcionando' });
});

app.get('/api/status', async (req, res) => {
  const database = await pingDatabase();

  return res.status(database.ok ? 200 : 503).json({
    api: 'online',
    database: database.ok ? 'connected' : 'disconnected',
    message: database.message,
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/chat', chatRoutes);

export default app;
