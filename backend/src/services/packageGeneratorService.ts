// backend/src/services/packageGeneratorService.ts
import { db } from '../database';

interface PackageGenerationParams {
    userId: number;
    destinationName: string;
    budget: number;
    adults: number;
    children: number;
    dateIn: string; // Formato 'DD/MM/YY'
    dateOut: string; // Formato 'DD/MM/YY'
}

interface GeneratedPackage {
    destination: string;
    budget: number;
    adults: number;
    children: number;
    dateIn: string;
    dateOut: string;
    items: {
        accommodation: any | null;
        food: any[];
        localTransport: any | null;
        destinationTransport: any | null;
        activities: any[];
        interests: any[];
        events: any[];
    };
    totalCost: number;
    userPreferencesApplied?: { [key: string]: string[] };
}

// Função auxiliar genérica para buscar min/max preço de uma tabela
const fetchMinMaxPriceByCategoryAndDestination = async (
    table: string,
    destinationValue: string | number,
    categoryColumn: string,
    categoryPrefs: string[],
    priceColumn: string = 'preco',
    destinationColumn: string = 'cidade',
    connection: any
): Promise<{ min: number; max: number }> => {
    if (categoryPrefs.length === 0) {
        try {
            const [rows]: any = await connection.query(
                `SELECT MIN(${priceColumn}) AS min_price, MAX(${priceColumn}) AS max_price
                 FROM ${table}
                 WHERE ${destinationColumn} = ?`,
                [destinationValue]
            );
            const min = parseFloat(rows[0]?.min_price || '0');
            const max = parseFloat(rows[0]?.max_price || '0');
            return { min, max };
        } catch (e) {
            console.warn(`Nenhuma preferência para ${table}, e erro ao buscar padrão:`, e);
            return { min: 0, max: 0 };
        }
    }

    const placeholders = categoryPrefs.map(() => '?').join(',');
    try {
        const [rows]: any = await connection.query(
            `SELECT MIN(${priceColumn}) AS min_price, MAX(${priceColumn}) AS max_price
             FROM ${table}
             WHERE ${destinationColumn} = ? AND ${categoryColumn} IN (${placeholders})`,
            [destinationValue, ...categoryPrefs]
        );
        const min = parseFloat(rows[0]?.min_price || '0');
        const max = parseFloat(rows[0]?.max_price || '0');
        return { min, max };
    } catch (queryError) {
        console.error(`Erro ao buscar min/max para ${table} (${categoryColumn}):`, queryError);
        return { min: 0, max: 0 };
    }
};

/**
 * Calcula o range de orçamento mínimo e máximo estimado para um pacote de viagem
 * baseado nas preferências do usuário e no destino.
 */
export const getBudgetRangeForCategory = async (
    userId: number,
    destinationName: string
): Promise<{ minBudget: number; maxBudget: number }> => {
    // --- CORREÇÃO AQUI: Obtendo a conexão e liberando no final ---
    const connection = await db.getConnection();
    try {
        let minTotal = 0;
        let maxTotal = 0;

        // 1. Obter as preferências do usuário
        const [userPrefsRows]: any = await connection.query(
            `SELECT op.categoria, op.descricao
             FROM preferencias_usuario pu
             JOIN opcoes_preferencia op ON pu.id_opcao = op.id
             WHERE pu.id_usuario = ?`,
            [userId]
        );

        const userPreferences: { [key: string]: string[] } = {};
        userPrefsRows.forEach((row: { categoria: string; descricao: string }) => {
            if (!userPreferences[row.categoria]) {
                userPreferences[row.categoria] = [];
            }
            userPreferences[row.categoria].push(row.descricao);
        });
        console.log("Preferências do usuário para cálculo de budget range:", userPreferences);
        console.log("Destino para cálculo de budget range:", destinationName);

        // 2. Obter o ID do destino
        const [destinationRows]: any = await connection.query(
            'SELECT id FROM destinos WHERE nome = ?',
            [destinationName]
        );
        if (destinationRows.length === 0) {
            console.warn('Destino não encontrado no banco de dados ao calcular range de orçamento.');
            return { minBudget: 0, maxBudget: 0 };
        }
        const destinationId = destinationRows[0].id;

        // Acomodação (estimativa para 3-7 noites, 1 pessoa)
        const accommodationPrefs = userPreferences['accommodation_preferences'] || [];
        const { min: minAcc, max: maxAcc } = await fetchMinMaxPriceByCategoryAndDestination(
            'hospedagem', destinationName, 'categoria', accommodationPrefs, 'preco', 'cidade', connection
        );
        minTotal += minAcc * 3;
        maxTotal += maxAcc * 7;

        // Alimentação (estimativa para 5-10 refeições, 1 pessoa)
        const foodPrefs = userPreferences['food_preferences'] || [];
        const { min: minFoodItem, max: maxFoodItem } = await fetchMinMaxPriceByCategoryAndDestination(
            'alimentacoes', destinationId, 'categoria', foodPrefs, 'preco', 'id_destino', connection
        );
        minTotal += (minFoodItem * 5);
        maxTotal += (maxFoodItem * 10);

        // Transporte Local (estimativa para 2-5 usos, 1 pessoa)
        const localTransportPrefs = userPreferences['local_transport_preferences'] || [];
        const { min: minLocalTrans, max: maxLocalTrans } = await fetchMinMaxPriceByCategoryAndDestination(
            'transporte_local', destinationName, 'tipo', localTransportPrefs, 'preco', 'cidade', connection
        );
        minTotal += (minLocalTrans * 2);
        maxTotal += (maxLocalTrans * 5);

        // Transporte para o Destino (ida e volta para 1 pessoa)
        const destTransportPrefs = userPreferences['destination_transport_preferences'] || [];
        let minDestTransPrice = 0;
        let maxDestTransPrice = 0;
        if (destTransportPrefs.length > 0) {
            const placeholders = destTransportPrefs.map(() => '?').join(',');
            const [transports]: any = await connection.query(
                `SELECT COALESCE(do.preco, da.preco) AS preco_total
                 FROM transporte_para_cidade t
                 LEFT JOIN detalhes_onibus do ON t.id = do.id_transporte
                 LEFT JOIN detalhes_avioes da ON t.id = da.id_transporte
                 WHERE t.cidade_destino = ? AND t.tipo IN (${placeholders})`,
                [destinationName, ...destTransportPrefs]
            );
            const transportPrices = transports.map((t: any) => parseFloat(t.preco_total || '0')).filter((p: number) => p > 0);
            if (transportPrices.length > 0) {
                minDestTransPrice = Math.min(...transportPrices);
                maxDestTransPrice = Math.max(...transportPrices);
            }
        }
        minTotal += minDestTransPrice * 2;
        maxTotal += maxDestTransPrice * 2;

        // Atividades (estimativa para 2-4 atividades, 1 pessoa)
        const activityPrefs = userPreferences['activity_preferences'] || [];
        const { min: minAct, max: maxAct } = await fetchMinMaxPriceByCategoryAndDestination(
            'atividades', destinationName, 'categoria', activityPrefs, 'preco', 'cidade', connection
        );
        minTotal += (minAct * 2);
        maxTotal += (maxAct * 4);

        // Interesses (estimativa para 1-2 interesses, 1 pessoa)
        const interestPrefs = userPreferences['interests'] || [];
        const { min: minInt, max: maxInt } = await fetchMinMaxPriceByCategoryAndDestination(
            'interesses', destinationName, 'categoria', interestPrefs, 'preco', 'cidade', connection
        );
        minTotal += (minInt * 1);
        maxTotal += (maxInt * 2);

        // Eventos (estimativa para 1 evento, 1 pessoa)
        const eventPrefs = userPreferences['activity_preferences']?.filter(p => ['Shows/Eventos', 'Vida Noturna/Baladas', 'Cinema/Teatro'].includes(p)) || [];
        let minEventPrice = 0;
        let maxEventPrice = 0;
        if (eventPrefs.length > 0) {
            const placeholders = eventPrefs.map(() => '?').join(',');
            const [events]: any = await connection.query(
                `SELECT MIN(preco) AS min_price, MAX(preco) AS max_price
                 FROM eventos
                 WHERE id_destino = ? AND categoria IN (${placeholders})`,
                [destinationId, ...eventPrefs]
            );
            minEventPrice = parseFloat(events[0]?.min_price || '0');
            maxEventPrice = parseFloat(events[0]?.max_price || '0');
        }
        minTotal += minEventPrice * 1;
        maxTotal += maxEventPrice * 1;

        // Garante um valor mínimo e arredonda para números mais "redondos"
        minTotal = Math.max(100, Math.floor(minTotal / 50) * 50);
        maxTotal = Math.max(minTotal + 500, Math.ceil(maxTotal / 100) * 100);

        return { minBudget: minTotal, maxBudget: maxTotal };

    } catch (error) {
        console.error('Erro ao obter range de orçamento:', error);
        throw error;
    } finally {
        connection.release();
    }
};

/**
 * Gera um pacote de viagem personalizado com base nas preferências, orçamento e outros detalhes.
 */
export const generateTravelPackage = async ({
    userId,
    destinationName,
    budget,
    adults,
    children,
    dateIn,
    dateOut,
}: PackageGenerationParams): Promise<GeneratedPackage> => {
    const connection = await db.getConnection();

    try {
        const generatedPackage: GeneratedPackage = {
            destination: destinationName,
            budget: budget,
            adults,
            children,
            dateIn,
            dateOut,
            items: {
                accommodation: null,
                food: [],
                localTransport: null,
                destinationTransport: null,
                activities: [],
                interests: [],
                events: []
            },
            totalCost: 0
        };

        let currentTotalCostIncludingFood: number = 0;
        let finalCalculatedCost: number = 0;
        const totalPeople = adults + children;

        // --- 0. Calcular Duração da Viagem (em dias/noites) ---
        const parseDate = (dateStr: string): Date => {
            const [day, month, year] = dateStr.split('/').map(Number);
            const fullYear = year < 100 ? 2000 + year : year;
            return new Date(fullYear, month - 1, day);
        };

        const dateInObj = parseDate(dateIn);
        const dateOutObj = parseDate(dateOut);
        
        let numberOfNights: number = 0;
        const timeDiff = dateOutObj.getTime() - dateInObj.getTime();
        if (timeDiff > 0) {
            numberOfNights = Math.floor(timeDiff / (1000 * 3600 * 24));
        }

        const actualNights = numberOfNights === 0 && dateIn !== dateOut ? 1 : numberOfNights;
        const numberOfDays = actualNights === 0 && dateIn === dateOut ? 1 : actualNights + 1;
        console.log(`Viagem de ${numberOfDays} dias / ${actualNights} noites.`);


        // 1. Obter as preferências do usuário
        const [userPrefsRows]: any = await connection.query(
            `SELECT op.categoria, op.descricao
             FROM preferencias_usuario pu
             JOIN opcoes_preferencia op ON pu.id_opcao = op.id
             WHERE pu.id_usuario = ?`,
            [userId]
        );

        const userPreferences: { [key: string]: string[] } = {};
        userPrefsRows.forEach((row: { categoria: string; descricao: string }) => {
            if (!userPreferences[row.categoria]) {
                userPreferences[row.categoria] = [];
            }
            userPreferences[row.categoria].push(row.descricao);
        });
        generatedPackage.userPreferencesApplied = userPreferences;


        // 2. Obter o ID do destino
        const [destinationRows]: any = await connection.query(
            'SELECT id FROM destinos WHERE nome = ?',
            [destinationName]
        );
        if (destinationRows.length === 0) {
            throw new Error('Destino não encontrado no banco de dados.');
        }
        const destinationId = destinationRows[0].id;


        // --- Alocações de orçamento por categoria (como frações do budget total) ---
        const accommodationBudgetShare = 0.4;
        const destinationTransportBudgetShare = 0.3;
        const localTransportBudgetShare = 0.05;
        const foodBudgetShare = 0.15;
        const activitiesBudgetShare = 0.05;
        const interestsBudgetShare = 0.03;
        const eventsBudgetShare = 0.02;


        // --- Lógica para selecionar Acomodação ---
        if (actualNights > 0) {
            const accommodationPrefs = userPreferences['accommodation_preferences'] || [];
            const targetPricePerNightPerPerson = (budget * accommodationBudgetShare) / Math.max(1, actualNights) / Math.max(1, totalPeople);
            const searchPriceLimit = targetPricePerNightPerPerson * 2;
            
            let accommodationQuery = `
                SELECT h.id, h.nome, h.endereco, h.cidade, h.categoria, ho.preco
                FROM hospedagem h
                JOIN hoteis ho ON h.id = ho.id_hospedagem
                WHERE h.cidade = ? AND ho.preco <= ?`;

            const accommodationParams: any[] = [destinationName, searchPriceLimit];
            if (accommodationPrefs.length > 0) {
                const placeholders = accommodationPrefs.map(() => '?').join(',');
                accommodationQuery += ` AND h.categoria IN (${placeholders})`;
                accommodationParams.push(...accommodationPrefs);
            }
            
            accommodationQuery += ` ORDER BY ABS(ho.preco - ?) ASC, RAND() LIMIT 5`;
            accommodationParams.push(targetPricePerNightPerPerson);
            const [accommodations]: any = await connection.query(accommodationQuery, accommodationParams);

            if (accommodations.length > 0) {
                let selectedAccommodation = null;
                const lowerBound = (budget * accommodationBudgetShare * 0.5);
                const upperBound = (budget * accommodationBudgetShare * 1.2);
                
                for (const acc of accommodations) {
                    const currentAccPrice = parseFloat(acc.preco || '0');
                    const estimatedCost = currentAccPrice * actualNights * totalPeople;
                    if (estimatedCost >= lowerBound && estimatedCost <= upperBound) {
                        selectedAccommodation = acc;
                        break;
                    }
                }
                
                if (!selectedAccommodation) {
                    selectedAccommodation = accommodations[0];
                }

                generatedPackage.items.accommodation = selectedAccommodation;
                const cost = parseFloat(selectedAccommodation.preco || '0') * actualNights * totalPeople;
                currentTotalCostIncludingFood += cost;
                finalCalculatedCost += cost;
                console.log(`Custo Acomodação: ${parseFloat(selectedAccommodation.preco || '0')} (diária) * ${actualNights} (noites) * ${totalPeople} (pessoas) = ${cost}`);
            } else {
                console.warn(`Nenhuma acomodação encontrada para ${destinationName} com as preferências e orçamento.`);
            }
        }


        // --- Lógica para selecionar Alimentação (Múltiplos itens) ---
        const foodPrefs = userPreferences['food_preferences'] || [];
        const mealsPerDayPerPerson = 3;
        const targetFoodItemsCount = numberOfDays * mealsPerDayPerPerson * totalPeople;
        const targetPricePerMealPerPerson = (budget * foodBudgetShare) / Math.max(1, targetFoodItemsCount);

        if (foodPrefs.length > 0 && targetFoodItemsCount > 0) {
            let foodQuery = `
                SELECT id, tipo, descricao, cidade, preco, categoria
                FROM alimentacoes
                WHERE id_destino = ?`;
            const foodParams: any[] = [destinationId];
            
            const placeholders = foodPrefs.map(() => '?').join(',');
            foodQuery += ` AND categoria IN (${placeholders})`;
            foodParams.push(...foodPrefs);
            
            foodQuery += ` ORDER BY ABS(preco - ?) ASC, RAND() LIMIT 20`;
            foodParams.push(targetPricePerMealPerPerson);
            const [allFoodOptions]: any = await connection.query(foodQuery, foodParams);
            
            if (allFoodOptions.length > 0) {
                for (let i = 0; i < targetFoodItemsCount; i++) {
                    const selectedFoodItem = allFoodOptions[Math.floor(Math.random() * allFoodOptions.length)];
                    if (selectedFoodItem) {
                        generatedPackage.items.food.push(selectedFoodItem);
                        currentTotalCostIncludingFood += parseFloat(selectedFoodItem.preco || '0');
                    }
                }
            } else {
                console.warn(`Nenhum item de alimentação encontrado para ${destinationName} com as preferências.`);
            }
        }
        console.log(`Custo Alimentação (temporário, incluído no currentTotalCostIncludingFood): ${generatedPackage.items.food.reduce((sum, item) => sum + parseFloat(item.preco || '0'), 0)}`);


        // --- Lógica para selecionar Transporte para o Destino (ida e volta) ---
        const destTransportPrefs = userPreferences['destination_transport_preferences'] || [];
        const totalDestinationTransportBudget = budget * destinationTransportBudgetShare;
        
        const targetPricePerPersonPerTrip = (totalDestinationTransportBudget / Math.max(1, totalPeople)) / 2;
        const searchPriceLimitDestTransport = targetPricePerPersonPerTrip * 2;

        let transportQuery = `
            SELECT t.id, t.tipo, t.descricao,
                   COALESCE(do.preco, da.preco) AS preco_estimado
            FROM transporte_para_cidade t
            LEFT JOIN detalhes_onibus do ON t.id = do.id_transporte
            LEFT JOIN detalhes_avioes da ON t.id = da.id_transporte
            WHERE t.cidade_destino = ? AND COALESCE(do.preco, da.preco) <= ?`;
        const transportParams: any[] = [destinationName, searchPriceLimitDestTransport];

        if (destTransportPrefs.length > 0) {
            const placeholders = destTransportPrefs.map(() => '?').join(',');
            transportQuery += ` AND t.tipo IN (${placeholders})`;
            transportParams.push(...destTransportPrefs);
        }
        transportQuery += ` ORDER BY ABS(COALESCE(do.preco, da.preco) - ?) ASC, RAND() LIMIT 5`;
        transportParams.push(targetPricePerPersonPerTrip);

        const [transports]: any = await connection.query(transportQuery, transportParams);

        if (transports.length > 0) {
            let selectedTransport = null;
            const lowerBound = (totalDestinationTransportBudget * 0.5);
            const upperBound = (totalDestinationTransportBudget * 1.2);
            for (const trans of transports) {
                const currentTransPrice = parseFloat(trans.preco_estimado || '0');
                const estimatedCost = currentTransPrice * totalPeople * 2;
                if (estimatedCost >= lowerBound && estimatedCost <= upperBound) {
                    selectedTransport = trans;
                    break;
                }
            }
            if (!selectedTransport) {
                selectedTransport = transports[0];
            }

            generatedPackage.items.destinationTransport = selectedTransport;
            const cost = parseFloat(selectedTransport.preco_estimado || '0') * totalPeople * 2;
            currentTotalCostIncludingFood += cost;
            finalCalculatedCost += cost;
            console.log(`Custo Transporte Destino: ${parseFloat(selectedTransport.preco_estimado || '0')} * ${totalPeople} * 2 (ida/volta) = ${cost}`);
        } else {
            console.warn(`Nenhum transporte para o destino encontrado para ${destinationName}.`);
        }


        // --- Lógica para selecionar Transporte Local ---
        const localTransportPrefs = userPreferences['local_transport_preferences'] || [];
        const minLocalTransportCostPerDayPerPerson = 25;
        const targetPricePerUsePerPersonLocalTransport = (budget * localTransportBudgetShare) / (Math.max(1, numberOfDays) * Math.max(1, totalPeople) * 2) || minLocalTransportCostPerDayPerPerson;
        const searchPriceLimitLocalTransport = targetPricePerUsePerPersonLocalTransport * 3;
        let localTransportQuery = `
            SELECT tl.id, tl.tipo, tl.descricao, tl.preco, ca.modelo, ca.ano, ca.tipo_combustivel
            FROM transporte_local tl
            LEFT JOIN carros_alugados ca ON tl.id = ca.id_transporte_local
            WHERE tl.cidade = ? AND tl.preco <= ?`;
        const localTransportParams: any[] = [destinationName, searchPriceLimitLocalTransport];

        if (localTransportPrefs.length > 0) {
            const placeholders = localTransportPrefs.map(() => '?').join(',');
            localTransportQuery += ` AND tl.tipo IN (${placeholders})`;
            localTransportParams.push(...localTransportPrefs);
        }
        localTransportQuery += ` ORDER BY ABS(tl.preco - ?) ASC, RAND() LIMIT 5`;
        localTransportParams.push(targetPricePerUsePerPersonLocalTransport);
        const [localTransports]: any = await connection.query(localTransportQuery, localTransportParams);

        if (localTransports.length > 0) {
            let selectedLocalTransport = null;
            const lowerBound = (budget * localTransportBudgetShare * 0.5);
            const upperBound = (budget * localTransportBudgetShare * 1.5);
            for (const trans of localTransports) {
                const currentTransPrice = parseFloat(trans.preco || '0');
                let estimatedCost = 0;
                if (trans.tipo === 'Carro Alugado') {
                    estimatedCost = currentTransPrice * numberOfDays;
                } else {
                    estimatedCost = currentTransPrice * numberOfDays * totalPeople * 2;
                }
                if (estimatedCost >= lowerBound && estimatedCost <= upperBound) {
                    selectedLocalTransport = trans;
                    break;
                }
            }
            if (!selectedLocalTransport) {
                selectedLocalTransport = localTransports[0];
            }
            generatedPackage.items.localTransport = selectedLocalTransport;
            let localTransportCost = 0;
            const selectedPrice = parseFloat(selectedLocalTransport.preco || '0');
            if (selectedLocalTransport.tipo === 'Carro Alugado') {
                localTransportCost = selectedPrice * numberOfDays;
            } else {
                localTransportCost = selectedPrice * numberOfDays * totalPeople * 2;
            }
            currentTotalCostIncludingFood += localTransportCost;
            finalCalculatedCost += localTransportCost;
            console.log(`Custo Transporte Local: ${selectedPrice} (unitário) * ${numberOfDays} (dias) * ${totalPeople} (pessoas/usos) = ${localTransportCost}`);
        } else {
            console.warn(`Nenhum transporte local encontrado para ${destinationName}.`);
        }


        // --- Lógica para selecionar Atividades e Interesses (múltiplos itens) ---
        const activityPrefs = userPreferences['activity_preferences'] || [];
        const interestPrefs = userPreferences['interests'] || [];
        const combinedActivityInterestPrefs = [...new Set([...activityPrefs, ...interestPrefs])];
        const targetActivitiesPerPersonPerDay = 0.5;
        const targetActivitiesCount = Math.min(Math.round(numberOfDays * totalPeople * targetActivitiesPerPersonPerDay), 10);
        const budgetPerActivityPerPerson = (budget * activitiesBudgetShare) / Math.max(1, targetActivitiesCount) / Math.max(1, totalPeople);
        const searchPriceLimitActivities = budgetPerActivityPerPerson * 3;

        if (combinedActivityInterestPrefs.length > 0 && targetActivitiesCount > 0) {
            let activitiesQuery = `
                SELECT id, nome, descricao, preco, categoria
                FROM atividades
                WHERE cidade = ? AND preco <= ?`;
            let activitiesParams: any[] = [destinationName, searchPriceLimitActivities];
            const placeholders = combinedActivityInterestPrefs.map(() => '?').join(',');
            activitiesQuery += ` AND categoria IN (${placeholders})`;
            activitiesParams.push(...combinedActivityInterestPrefs);
            activitiesQuery += ` ORDER BY ABS(preco - ?) ASC, RAND() LIMIT 15`;
            activitiesParams.push(budgetPerActivityPerPerson);
            const [allActivities]: any = await connection.query(activitiesQuery, activitiesParams);
            
            if (allActivities.length > 0) {
                let currentActivitiesCount = 0;
                while (currentActivitiesCount < targetActivitiesCount && allActivities.length > 0) {
                    const randomIndex = Math.floor(Math.random() * allActivities.length);
                    const selectedActivity = allActivities.splice(randomIndex, 1)[0];
                    if (selectedActivity) {
                        generatedPackage.items.activities.push(selectedActivity);
                        currentActivitiesCount++;
                        finalCalculatedCost += parseFloat(selectedActivity.preco || '0') * totalPeople;
                        console.log(`Custo Atividade: ${parseFloat(selectedActivity.preco || '0')} * ${totalPeople} (pessoas) = ${parseFloat(selectedActivity.preco || '0') * totalPeople}`);
                    }
                }
            }
        }


        // --- Lógica para selecionar Interesses ---
        const budgetPerInterestPerPerson = (budget * interestsBudgetShare) / Math.max(1, totalPeople);
        const searchPriceLimitInterests = budgetPerInterestPerPerson * 2;
        if (interestPrefs.length > 0) {
            let interestsQuery = `
                SELECT id, nome, descricao, preco, categoria
                FROM interesses
                WHERE cidade = ? AND preco <= ?`;
            let interestsParams: any[] = [destinationName, searchPriceLimitInterests];
            const placeholders = interestPrefs.map(() => '?').join(',');
            interestsQuery += ` AND categoria IN (${placeholders})`;
            interestsParams.push(...interestPrefs);
            interestsQuery += ` ORDER BY ABS(preco - ?) ASC, RAND() LIMIT 2`;
            interestsParams.push(budgetPerInterestPerPerson);
            const [interests]: any = await connection.query(interestsQuery, interestsParams);
            generatedPackage.items.interests = interests;
            interests.forEach((interest: any) => {
                const cost = parseFloat(interest.preco || '0') * totalPeople;
                finalCalculatedCost += cost;
                console.log(`Custo Interesse: ${parseFloat(interest.preco || '0')} * ${totalPeople} (pessoas) = ${cost}`);
            });
        }


        // --- Lógica para selecionar Eventos ---
        const eventPrefs = userPreferences['activity_preferences']?.filter(p => ['Shows/Eventos', 'Vida Noturna/Baladas', 'Cinema/Teatro'].includes(p)) || [];
        const budgetForEventsPerPersonPerDay = (budget * eventsBudgetShare) / Math.max(1, numberOfDays) / Math.max(1, totalPeople);
        const sqlDateIn = `${dateInObj.getFullYear()}-${(dateInObj.getMonth() + 1).toString().padStart(2, '0')}-${dateInObj.getDate().toString().padStart(2, '0')}`;
        const sqlDateOut = `${dateOutObj.getFullYear()}-${(dateOutObj.getMonth() + 1).toString().padStart(2, '0')}-${dateOutObj.getDate().toString().padStart(2, '0')}`;

        let eventsQuery = `
            SELECT id, nome, descricao, preco, data_hora, categoria
            FROM eventos
            WHERE id_destino = ? AND preco <= ? AND data_hora BETWEEN ? AND ?`;
        let eventsParams = [destinationId, budgetForEventsPerPersonPerDay, sqlDateIn, sqlDateOut];

        if (eventPrefs.length > 0) {
            const placeholders = eventPrefs.map(() => '?').join(',');
            eventsQuery += ` AND categoria IN (${placeholders})`;
            eventsParams.push(...eventPrefs);
        }
        eventsQuery += ` ORDER BY RAND() LIMIT 2`;
        const [events]: any = await connection.query(eventsQuery, eventsParams);
        generatedPackage.items.events = events;
        events.forEach((event: any) => {
            const cost = parseFloat(event.preco || '0') * totalPeople;
            finalCalculatedCost += cost;
            console.log(`Custo Evento: ${parseFloat(event.preco || '0')} * ${totalPeople} (pessoas) = ${cost}`);
        });
        
        // Custo total final do pacote (sem alimentação)
        generatedPackage.totalCost = finalCalculatedCost;
        console.log(`Custo Total Final Calculado: ${generatedPackage.totalCost.toFixed(2)}`);

        // Ajuste final para tentar chegar mais perto do orçamento
        const budgetReachedPercentage = finalCalculatedCost / budget;
        const minimumBudgetAchievedPercentage = 0.5;
        const remainingBudget = budget - finalCalculatedCost;

        if (budgetReachedPercentage < minimumBudgetAchievedPercentage && remainingBudget > 0) {
            const contingencyAmount = Math.min(remainingBudget * 0.75, budget * 0.30);
            finalCalculatedCost += contingencyAmount;
            console.log(`Adicionado contingência para aproximar do orçamento. Valor adicionado: ${contingencyAmount.toFixed(2)}. Novo Custo Total: ${finalCalculatedCost.toFixed(2)}`);
        } else if (finalCalculatedCost === 0 && budget > 0) {
            finalCalculatedCost = budget * 0.20;
            console.log(`Custo zero, atribuindo 20% do orçamento como custo mínimo: ${finalCalculatedCost.toFixed(2)}`);
        }

        generatedPackage.totalCost = parseFloat(finalCalculatedCost.toFixed(2));
        console.log(`Custo Total Final Calculado (descontando alimentação): ${generatedPackage.totalCost}`);

        return generatedPackage;

    } catch (error) {
        console.error('Erro ao gerar pacote de viagem no serviço:', error);
        throw error;
    } finally {
        connection.release();
    }
};