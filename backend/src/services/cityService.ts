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
// Esta é a função chamada pelo controller calculatePackageBudgetController.
// ===============================================
export const calculateTotalBudget = async (
    cityName: string,
    userId: number,
    numPeople: number,
    numDays: number
): Promise<CityDetails | null> => {
    // 1. Obter os custos base diários (por quarto e por pessoa/dia)
    const baseDetails = await getCityDetails(cityName, userId);
    if (!baseDetails) return null;

    const { minDailyRoom, maxDailyRoom, minDailyPerPerson, maxDailyPerPerson } = baseDetails;

    // 2. Cálculo do total de Hospedagem (Custo do quarto * Dias)
    // A hospedagem é por quarto, não por pessoa.
    const minH_total = minDailyRoom * numDays;
    const maxH_total = maxDailyRoom * numDays;
    
    // 3. Cálculo do total de Alimentação/Atividades 
    // (Custo P/P/Dia * Dias * Pessoas)
    const minAP_total = minDailyPerPerson * numDays * numPeople;
    const maxAP_total = maxDailyPerPerson * numDays * numPeople;

    // 4. Soma dos totais
    const minTotal = minH_total + minAP_total;
    const maxTotal = maxH_total + maxAP_total;

    return {
        nome: cityName,
        minBudget: parseFloat(minTotal.toFixed(2)),
        maxBudget: parseFloat(maxTotal.toFixed(2)),
    };
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