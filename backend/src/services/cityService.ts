import { db } from '../database';

export const getCitiesFromDb = async (searchText?: string) => {
  let query = 'SELECT DISTINCT nome FROM destinos';
  const params: string[] = [];

  if (searchText) {
    query += ' WHERE nome LIKE ?';
    params.push(`%${searchText}%`);
  }

  query += ' ORDER BY nome ASC LIMIT 10'; // Ajuste o ORDER BY para 'nome'

  try {
    const [rows] = await db.execute(query, params);

    // MODIFICAÇÃO: Mapeie os resultados para um ARRAY DE OBJETOS com a propriedade 'nome'
    const cities = (rows as any[]).map((row: any) => ({ nome: row.nome })); // <<-- ALTE ISSA LINHA!

    return cities; // Isso agora retornará: [{ nome: 'São Paulo' }, { nome: 'Rio de Janeiro' }]
  } catch (error) {
    console.error('Erro ao buscar cidades do banco de dados:', error);
    throw new Error('Não foi possível buscar as cidades. Detalhes: ' + (error as Error).message);
  }
};