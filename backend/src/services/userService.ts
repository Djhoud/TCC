// backend/src/services/userService.ts
import { db } from '../database';

// Busca usuário pelo ID
export const getUserById = async (userId: number) => {
  try {
    const [rows] = await db.execute(
      'SELECT nome AS name, email, documento AS cpf FROM usuarios WHERE id = ?',
      [userId]
    );
    return (rows as any[])[0] || null;
  } catch (error) {
    console.error('Erro ao buscar usuário pelo ID:', error);
    throw error;
  }
};

// Busca histórico de viagens do usuário
export const getUserTravelHistory = async (userId: number) => {
  try {
    const [rows] = await db.execute(
      `SELECT id, destino, data_entrada AS dateIn, data_saida AS dateOut, orcamento AS budget, itens
       FROM pacotes_viagem
       WHERE id_usuario = ?
       ORDER BY data_geracao DESC`,
      [userId]
    );
    return rows;
  } catch (error) {
    console.error('Erro ao buscar histórico de viagens do usuário:', error);
    throw error;
  }
};
