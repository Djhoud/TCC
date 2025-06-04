// backend/src/services/cityService.ts
import { db } from '../database';

export const getCitiesFromDb = async (searchText?: string) => {
  // MODIFICAÇÃO: Ajuste o nome da tabela para 'destinos' e da coluna para 'nome'
  let query = 'SELECT DISTINCT nome FROM destinos';
  const params: string[] = [];

  if (searchText) {
    // MODIFICAÇÃO: Ajuste a coluna na cláusula WHERE também para 'nome'
    query += ' WHERE nome LIKE ?';
    params.push(`%${searchText}%`);
  }

  query += ' ORDER BY nome ASC LIMIT 10'; // Ajuste o ORDER BY para 'nome'

  try {
    const [rows] = await db.execute(query, params);

    // MODIFICAÇÃO: Mapeie os resultados para 'row.nome'
    const cityNames = (rows as any[]).map((row: any) => row.nome);
    return cityNames;
  } catch (error) {
    console.error('Erro ao buscar cidades do banco de dados:', error);
    // É bom lançar o erro original ou uma mensagem mais específica para depuração
    throw new Error('Não foi possível buscar as cidades. Detalhes: ' + (error as Error).message);
  }
};