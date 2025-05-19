import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { db } from './database'; // ajuste o caminho conforme sua estrutura de pastas

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Servidor rodando com sucesso! 🚀');
});

// Rota para testar banco
app.get('/api/users', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM usuarios'); // ajuste conforme sua tabela
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao buscar usuários no banco' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
