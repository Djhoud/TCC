// Arquivo: backend/index.ts
import cors from 'cors';
import dotenv from 'dotenv';
import express, { ErrorRequestHandler } from 'express';
import { db } from './database';
import verifyToken from './middleware/authMiddleware';
import authRoutes from './routes/authRoutes';
import preferenceRoutes from './routes/preferencesRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

app.use('/auth', authRoutes);
app.use('/api/preferences', verifyToken, preferenceRoutes);

app.get('/', (req, res) => {
  res.send('Servidor rodando com sucesso! 🚀');
});

app.get('/api/users', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM usuarios');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao buscar usuários no banco' });
  }
});

// Middleware de tratamento de erros (DEVE SER O ÚLTIMO app.use)
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error('Erro capturado pelo errorHandler:', err);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode; // Mantém o status code se já foi setado, senão usa 500
  // Garanta que a resposta de erro seja SEMPRE JSON
  res.status(statusCode).json({
    message: err.message || 'Um erro inesperado ocorreu.',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};
app.use(errorHandler);


app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});