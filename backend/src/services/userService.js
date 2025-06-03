// backend/src/services/userService.js (ou databaseService.js)
import { db } from '../database/index.ts'; // Assumindo que sua conexão com o banco de dados é exportada de index.ts

export const getUsersFromDB = async () => {
  try {
    const [rows] = await db.execute('SELECT * FROM usuarios'); // Exemplo de consulta SQL
    return rows;
  } catch (error) {
    console.error('Erro ao buscar usuários do DB:', error);
    throw new Error('Não foi possível recuperar os usuários.');
  }
};

// Você também pode ter funções como:
// export const getUserByEmail = async (email) => { ... };
// export const createUser = async (userData) => { ... };