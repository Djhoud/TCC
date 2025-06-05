// backend/src/index.ts
import cors from 'cors';
import dotenv from 'dotenv';
import express, { ErrorRequestHandler } from 'express';
import { db } from './database';
import verifyToken from './middleware/authMiddleware';
import authRoutes from './routes/authRoutes';
import cityRoutes from './routes/cityRoutes';
import packageRoutes from './routes/packageRoutes'; // Adicione esta linha!
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

// Rotas de autenticação (não protegidas por verifyToken)
app.use('/auth', authRoutes);

// Rotas protegidas por verifyToken
app.use('/api/preferences', verifyToken, preferenceRoutes);
app.use('/api/packages', verifyToken, packageRoutes); // Adicione/Confirme esta linha!
app.use('/api', cityRoutes); // Rota de cidades (já estava aqui)

app.get('/', (req, res) => {
  res.send('Servidor rodando com sucesso! 🚀');
});

app.get('/api/users', verifyToken, async (req, res) => { // Protegendo esta rota também
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
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message || 'Um erro inesperado ocorreu.',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});