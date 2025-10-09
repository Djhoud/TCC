import { RowDataPacket } from 'mysql2'; // Importe o tipo correto, se estiver usando mysql2/promise
import { db } from '../database';

interface CityDetails {
    nome: string;
    minBudget: number;
    maxBudget: number;
}

// Defina um tipo genérico para a row da sugestão
interface SuggestionRow extends RowDataPacket {
    nome: string;
}

export const getCitySuggestions = async (searchText?: string) => {
    let query = 'SELECT DISTINCT nome FROM destinos';
    const params: string[] = [];

    if (searchText) {
        query += ' WHERE nome LIKE ?';
        params.push(`%${searchText}%`);
    }

    query += ' ORDER BY nome ASC LIMIT 10';

    try {
        // CORREÇÃO 1: Cast explícito de rows para um array de objetos de dados
        const [rows] = await db.execute(query, params);
        
        // Se você estiver usando 'mysql2/promise', o tipo correto é 'RowDataPacket[]'
        const cities = (rows as SuggestionRow[]).map((row: SuggestionRow) => ({ nome: row.nome })); 
        return cities;
    } catch (error) {
        console.error('Erro ao buscar cidades do banco de dados:', error);
        throw new Error('Não foi possível buscar as cidades. Detalhes: ' + (error as Error).message);
    }
};

/**
 * Busca detalhes da cidade com o orçamento calculado dinamicamente
 */
export const getCityDetails = async (cityName: string, dias: number): Promise<CityDetails | null> => {
    if (!cityName) {
        return null;
    }
    
    // 1. Busca de Orçamento Mínimo e Máximo de Hospedagem (hoteis)
    const hospedagemQuery = `
        SELECT MIN(h.preco) as minH, MAX(h.preco) as maxH 
        FROM hoteis h
        JOIN hospedagem ON hospedagem.id = h.id_hospedagem
        WHERE hospedagem.cidade = ?
    `;
    
    // 2. Busca de Orçamento Mínimo e Máximo de Alimentação (alimentacoes)
    const alimentacaoQuery = `
        SELECT MIN(preco) as minA, MAX(preco) as maxA 
        FROM alimentacoes 
        WHERE cidade = ?
    `;

    // 3. Busca de Orçamento Mínimo e Máximo de Atividades (atividades)
    const atividadesQuery = `
        SELECT MIN(preco) as minAt, MAX(preco) as maxAt
        FROM atividades
        WHERE cidade = ?
    `;

    try {
        // CORREÇÃO 2a: Cast explícito
        const [hospedagemRows] = await db.execute(hospedagemQuery, [cityName]);
        const [alimentacaoRows] = await db.execute(alimentacaoQuery, [cityName]);
        const [atividadesRows] = await db.execute(atividadesQuery, [cityName]);

        const hResult = (hospedagemRows as any)[0];
        const aResult = (alimentacaoRows as any)[0];
        const atResult = (atividadesRows as any)[0];
        
        // Extrai e converte os valores agregados (usando 0 como fallback)
        const minH = parseFloat(hResult?.minH) || 0;
        const maxH = parseFloat(hResult?.maxH) || 0;
        
        const minA = parseFloat(aResult?.minA) || 0;
        const maxA = parseFloat(aResult?.maxA) || 0;
        
        const minAt = parseFloat(atResult?.minAt) || 0;
        const maxAt = parseFloat(atResult?.maxAt) || 0;

        // Lógica de Agregação (Orçamento Diário Estimado):
        const minTotal = minH + minA + minAt;
        const maxTotal = maxH + maxA + maxAt;
        
        // Retorna um placeholder se não houver dados de custo, mas a cidade existir
        if (minTotal === 0 && maxTotal === 0) {
            
            // CORREÇÃO 2b: Cast explícito antes de usar .length
            const [cidadeExisteRows] = await db.execute('SELECT nome FROM destinos WHERE nome = ?', [cityName]);
            
            // Agora o TypeScript sabe que 'cidadeExisteRows' é um array e tem .length
            if ((cidadeExisteRows as any[]).length > 0) {
                return { nome: cityName, minBudget: 50, maxBudget: 500 }; 
            }
            return null; // Cidade realmente não encontrada
        }

        return {
            nome: cityName,
            minBudget: parseFloat(minTotal.toFixed(2)),
            maxBudget: parseFloat(maxTotal.toFixed(2)),
        };

    } catch (error) {
        console.error(`Erro ao buscar detalhes da cidade ${cityName} (agregando custos):`, error);
        // Usa valores padrão em caso de erro na consulta, para não quebrar a aplicação
        return { nome: cityName, minBudget: 0, maxBudget: 5000 };
    }
};