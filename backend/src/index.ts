import cors from 'cors';
import dotenv from 'dotenv';
import express, { ErrorRequestHandler } from 'express';
import verifyToken from './middleware/authMiddleware';
import alternativeRoutes from './routes/alternativeRoutes';
import authRoutes from './routes/authRoutes';
import cityRoutes from './routes/cityRoutes';
import packageRoutes from './routes/packageRoutes';
import preferenceRoutes from './routes/preferencesRoutes';
import profileRoutes from './routes/profileRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

app.use('/api/alternatives', verifyToken, alternativeRoutes);

// Rotas de autenticação (sem proteção)
app.use('/auth', authRoutes);

// Rotas protegidas por verifyToken
app.use('/api/users', profileRoutes);
app.use('/api/preferences', verifyToken, preferenceRoutes);
app.use('/api/packages', verifyToken, packageRoutes);
app.use('/api/cities', cityRoutes);

app.get('/', (req, res) => {
  res.send('Servidor rodando com sucesso! 🚀');
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