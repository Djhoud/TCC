import { RowDataPacket } from 'mysql2';
import { db } from '../database';

interface CityDetails {
    nome: string;
    minBudget: number;
    maxBudget: number;
}

export interface CityReferenceBudget {
    nome: string;
    minBudget: number;
    maxBudget: number;
    minDailyRoom: number;
    maxDailyRoom: number;
    minDailyPerPerson: number;
    maxDailyPerPerson: number;
}

interface UserPreferences {
    preferencia_hospedagem: string;
    preferencia_alimentacao: string;
    preferencia_atividades: string;
}

// ===============================================
// FUNÇÕES AUXILIARES
// ===============================================
const getUserPreferences = async (userId: number): Promise<UserPreferences> => {
    const query = `
        SELECT
            MAX(CASE WHEN op.categoria = 'Hospedagem' THEN op.descricao ELSE NULL END) AS preferencia_hospedagem,
            MAX(CASE WHEN op.categoria = 'Alimentacao' THEN op.descricao ELSE NULL END) AS preferencia_alimentacao,
            MAX(CASE WHEN op.categoria = 'Atividades' THEN op.descricao ELSE NULL END) AS preferencia_atividades
        FROM preferencias_usuario pu
        JOIN opcoes_preferencia op ON pu.id_opcao = op.id
        WHERE pu.id_usuario = ?
        GROUP BY pu.id_usuario;
    `;

    try {
        const [rows] = await db.execute<RowDataPacket[]>(query, [userId]);
        const preferences = rows[0] as UserPreferences;

        if (!preferences) {
            return {
                preferencia_hospedagem: 'Medio',
                preferencia_alimentacao: 'Casual',
                preferencia_atividades: 'Cultural',
            };
        }

        return {
            preferencia_hospedagem: preferences.preferencia_hospedagem || 'Medio',
            preferencia_alimentacao: preferences.preferencia_alimentacao || 'Casual',
            preferencia_atividades: preferences.preferencia_atividades || 'Cultural',
        };
    } catch (error) {
        console.error('Erro ao buscar preferências do usuário:', error);
        return {
            preferencia_hospedagem: 'Medio',
            preferencia_alimentacao: 'Casual',
            preferencia_atividades: 'Cultural',
        };
    }
};

const getCostCriteria = (preference: string) => {
    const tablePrefix = 'hospedagem.';
    switch (preference) {
        case 'Luxo':
        case 'Gourmet':
        case 'Aventura':
            return `OR ${tablePrefix}categoria = ?`;
        case 'Economico':
        case 'Barato':
        case 'Relax':
            return `OR ${tablePrefix}categoria = ?`;
        case 'Medio':
        case 'Casual':
        case 'Cultural':
        default:
            return `OR ${tablePrefix}categoria = ? OR ${tablePrefix}categoria = ?`;
    }
};

// ===============================================
// FUNÇÃO 1: DETALHES DA CIDADE (BASE DIÁRIA)
// ===============================================
export const getCityDetails = async (
    cityName: string,
    userId: number
): Promise<CityReferenceBudget | null> => {
    if (!cityName) return null;

    const prefs = await getUserPreferences(userId);

    const hCriteria = getCostCriteria(prefs.preferencia_hospedagem);
    const hParams: (string | number)[] = [cityName, prefs.preferencia_hospedagem];
    if (hCriteria.includes('OR hospedagem.categoria = ? OR hospedagem.categoria = ?')) {
        const alt1 = prefs.preferencia_hospedagem === 'Medio' ? 'Economico' : 'Medio';
        const alt2 = prefs.preferencia_hospedagem === 'Economico' ? 'Medio' : 'Luxo';
        hParams.push(alt1, alt2);
    }

    const hospedagemQuery = `
        SELECT MIN(h.preco) as minH, MAX(h.preco) as maxH 
        FROM hoteis h 
        JOIN hospedagem ON hospedagem.id = h.id_hospedagem 
        WHERE hospedagem.cidade = ? AND (hospedagem.categoria = ? ${hCriteria});
    `;

    const aCriteria = getCostCriteria(prefs.preferencia_alimentacao);
    const aParams: (string | number)[] = [cityName, prefs.preferencia_alimentacao];
    if (aCriteria.includes('OR categoria = ? OR categoria = ?')) {
        aParams.push(prefs.preferencia_alimentacao === 'Casual' ? 'Barato' : 'Casual');
    }
    const alimentacaoQuery = `
        SELECT MIN(preco) as minA, MAX(preco) as maxA 
        FROM alimentacoes 
        WHERE cidade = ? AND (categoria = ? ${aCriteria});
    `;

    const atCriteria = getCostCriteria(prefs.preferencia_atividades);
    const atParams: (string | number)[] = [cityName, prefs.preferencia_atividades];
    if (atCriteria.includes('OR categoria = ? OR categoria = ?')) {
        atParams.push(prefs.preferencia_atividades === 'Cultural' ? 'Relax' : 'Cultural');
    }
    const atividadesQuery = `
        SELECT MIN(preco) as minAt, MAX(preco) as maxAt
        FROM atividades
        WHERE cidade = ? AND (categoria = ? ${atCriteria});
    `;

    try {
        const [hospedagemRows] = await db.execute<RowDataPacket[]>(hospedagemQuery, hParams);
        const [alimentacaoRows] = await db.execute<RowDataPacket[]>(alimentacaoQuery, aParams);
        const [atividadesRows] = await db.execute<RowDataPacket[]>(atividadesQuery, atParams);

        const h = hospedagemRows[0] || {};
        const a = alimentacaoRows[0] || {};
        const at = atividadesRows[0] || {};

        const minH_daily = parseFloat(h.minH as string) || 0;
        const maxH_daily = parseFloat(h.maxH as string) || 0;
        const minA_daily = parseFloat(a.minA as string) || 0;
        const maxA_daily = parseFloat(a.maxA as string) || 0;
        const minAt_daily = parseFloat(at.minAt as string) || 0;
        const maxAt_daily = parseFloat(at.maxAt as string) || 0;

        const minDailyRoom = parseFloat(minH_daily.toFixed(2));
        const maxDailyRoom = parseFloat(maxH_daily.toFixed(2));
        const minDailyPerPerson = parseFloat((minA_daily + minAt_daily).toFixed(2));
        const maxDailyPerPerson = parseFloat((maxA_daily + maxAt_daily).toFixed(2));

        const minTotalReference = minDailyRoom + minDailyPerPerson;
        const maxTotalReference = maxDailyRoom + maxDailyPerPerson;

        const MIN_FALLBACK_BASE = 150;
        const MAX_FALLBACK_BASE = 2000;

        if (minTotalReference === 0 && maxTotalReference === 0) {
            const [cidadeExisteRows] = await db.execute<RowDataPacket[]>(
                'SELECT nome FROM destinos WHERE nome = ?',
                [cityName]
            );
            if (cidadeExisteRows.length > 0) {
                return {
                    nome: cityName,
                    minBudget: MIN_FALLBACK_BASE,
                    maxBudget: MAX_FALLBACK_BASE,
                    minDailyRoom: 0,
                    maxDailyRoom: 0,
                    minDailyPerPerson: MIN_FALLBACK_BASE,
                    maxDailyPerPerson: MAX_FALLBACK_BASE,
                };
            }
            return null;
        }

        return {
            nome: cityName,
            minBudget: minTotalReference,
            maxBudget: maxTotalReference,
            minDailyRoom,
            maxDailyRoom,
            minDailyPerPerson,
            maxDailyPerPerson,
        };
    } catch (error) {
        console.error(`Erro ao buscar detalhes da cidade ${cityName}:`, error);
        const MIN_FALLBACK_BASE = 150;
        const MAX_FALLBACK_BASE = 2000;
        return {
            nome: cityName,
            minBudget: MIN_FALLBACK_BASE,
            maxBudget: MAX_FALLBACK_BASE,
            minDailyRoom: 0,
            maxDailyRoom: 0,
            minDailyPerPerson: MIN_FALLBACK_BASE,
            maxDailyPerPerson: MAX_FALLBACK_BASE,
        };
    }
};

// ===============================================
// FUNÇÃO 2: CÁLCULO TOTAL AJUSTADO (Com multiplicação por dias e pessoas)
// ===============================================
// ===============================================
// FUNÇÃO 2: CÁLCULO TOTAL AJUSTADO (MAIS REALISTA)
// ===============================================
// NO cityService.ts - CORREÇÃO DA FUNÇÃO calculateTotalBudget

export const calculateTotalBudget = async (
    cityName: string,
    userId: number,
    numPeople: number,
    numDays: number
): Promise<CityDetails | null> => {
    try {
        // 1. Obter os custos base diários
        const baseDetails = await getCityDetails(cityName, userId);
        if (!baseDetails) return null;

        const { minDailyRoom, maxDailyRoom, minDailyPerPerson, maxDailyPerPerson } = baseDetails;

        console.log(`📊 Base diária para ${cityName}:`, {
            minDailyRoom,
            maxDailyRoom, 
            minDailyPerPerson,
            maxDailyPerPerson,
            numPeople,
            numDays
        });

        // 2. Cálculo MAIS REALISTA E CONSERVADOR
        // Usar média ponderada (não só máximos)
        const realisticDailyRoom = minDailyRoom > 0 ? 
            (minDailyRoom + maxDailyRoom) * 0.4 : // 40% da faixa se tiver valores
            (numPeople * 80); // Fallback: R$ 80 por pessoa se não encontrar dados

        const realisticDailyPerPerson = minDailyPerPerson > 0 ?
            (minDailyPerPerson + maxDailyPerPerson) * 0.3 : // 30% da faixa
            (100); // Fallback: R$ 100 por pessoa/dia

        // 3. Cálculo TOTAL mais realista
        const realisticH_total = realisticDailyRoom * numDays;
        const realisticAP_total = realisticDailyPerPerson * numDays * numPeople;

        let realisticTotal = realisticH_total + realisticAP_total;

        // ✅ CORREÇÃO CRÍTICA: VALORES MAIS REALISTAS
        // Para evitar valores absurdamente altos
        const BUDGET_MULTIPLIER = 1.2; // Apenas 20% acima do custo realista
        
        const minTotal = Math.floor(realisticTotal * 0.8);   // 80% do realista
        const maxTotal = Math.floor(realisticTotal * BUDGET_MULTIPLIER); // 120% do realista

        // ✅ LIMITES ABSOLUTOS MAIS CONSERVADORES
        const ABSOLUTE_MIN = 300;
        const ABSOLUTE_MAX = 8000; // Reduzido de 10000 para 8000

        const finalMin = Math.max(ABSOLUTE_MIN, minTotal);
        const finalMax = Math.min(ABSOLUTE_MAX, Math.max(finalMin + 500, maxTotal));

        // ✅ ARREDONDAMENTO PARA VALORES "AMIGÁVEIS"
        const roundedMin = Math.ceil(finalMin / 50) * 50;  // Múltiplos de 50
        const roundedMax = Math.ceil(finalMax / 100) * 100; // Múltiplos de 100

        console.log(`🎯 Budget range REALISTA para ${cityName}:`, {
            realisticTotal: realisticTotal.toFixed(2),
            finalMin: roundedMin,
            finalMax: roundedMax,
            calculation: `${numDays}d × ${numPeople}p`
        });

        return {
            nome: cityName,
            minBudget: roundedMin,
            maxBudget: roundedMax,
        };
    } catch (error) {
        console.error(`Erro ao calcular orçamento total para ${cityName}:`, error);
        
        // ✅ FALLBACK MAIS CONSERVADOR
        const fallbackMin = 500;
        const fallbackMax = 3000;
        
        console.log(`🔄 Usando fallback para ${cityName}: R$ ${fallbackMin} - R$ ${fallbackMax}`);
        
        return {
            nome: cityName,
            minBudget: fallbackMin,
            maxBudget: fallbackMax,
        };
    }
};

// ===============================================
// FUNÇÃO 3: SUGESTÕES DE CIDADES
// ===============================================
export const getCitySuggestions = async (searchText?: string) => {
    let query = 'SELECT DISTINCT nome FROM destinos';
    const params: string[] = [];

    if (searchText) {
        query += ' WHERE nome LIKE ?';
        params.push(`%${searchText}%`);
    }

    query += ' ORDER BY nome ASC LIMIT 10';

    try {
        const [rows] = await db.execute<RowDataPacket[]>(query, params);
        return rows.map((r) => ({ nome: r.nome }));
    } catch (error) {
        console.error('Erro ao buscar cidades:', error);
        throw new Error('Não foi possível buscar as cidades. Detalhes: ' + (error as Error).message);
    }
};