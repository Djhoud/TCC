import { db } from '../database';

interface PackageGenerationParams {
    userId: number;
    destinationName: string;
    budget: number;
    adults: number;
    children: number;
    dateIn: string;
    dateOut: string;
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

// ✅ FUNÇÃO DE CÁLCULO AJUSTADA: Multiplica food/activities por pessoas
const calculateItemTotalCost = (
    item: any, 
    type: string, 
    numNights: number, 
    numDays: number, 
    numPeople: number
): number => {
    if (!item) return 0;
    
    const price = parseFloat(
        item.preco || 
        item.preco_estimado || 
        item.preco_estimadoo || 
        '0'
    );
    
    switch (type) {
        case 'accommodation':
            return price * numNights;
        case 'destinationTransport':
            return price * numPeople * 2; // ida + volta
        case 'localTransport':
            return price * numDays;
        // ✅ food, activities, interests, events: preço por unidade, mas cobrado por pessoa
        case 'food':
        case 'activity':
        case 'interest':
        case 'event':
            return price * numPeople;
        default:
            return price;
    }
};

const calculateArrayTotal = (
    items: any[], 
    type: string, 
    numNights: number, 
    numDays: number, 
    numPeople: number
): number => {
    if (!items || !Array.isArray(items)) return 0;
    return items.reduce((total, item) => total + calculateItemTotalCost(item, type, numNights, numDays, numPeople), 0);
};

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

        const totalPeople = adults + children;

        // --- Calcular Duração da Viagem ---
        const parseDate = (dateStr: string): Date => {
            if (dateStr.includes('T')) {
                return new Date(dateStr);
            } else {
                const [day, month, year] = dateStr.split('/').map(Number);
                const fullYear = year < 100 ? 2000 + year : year;
                return new Date(fullYear, month - 1, day);
            }
        };

        const dateInObj = parseDate(dateIn);
        const dateOutObj = parseDate(dateOut);
        
        let timeDiff = dateOutObj.getTime() - dateInObj.getTime();
        let numberOfNights = timeDiff > 0 ? Math.floor(timeDiff / (1000 * 3600 * 24)) : 0;
        let numberOfDays = numberOfNights === 0 ? 1 : numberOfNights + 1;
        if (dateIn === dateOut) {
            numberOfNights = 0;
            numberOfDays = 1;
        }

        console.log(`\n🎯 GERANDO PACOTE PARA: ${destinationName}`);
        console.log(`📅 ${numberOfDays} dias / ${numberOfNights} noites, ${totalPeople} pessoas`);
        console.log(`💰 Orçamento (slider): R$ ${budget}`);

        // 1. Obter preferências do usuário
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

        // 2. Obter ID do destino
        const [destinationRows]: any = await connection.query(
            'SELECT id FROM destinos WHERE nome = ?',
            [destinationName]
        );
        if (destinationRows.length === 0) {
            throw new Error('Destino não encontrado no banco de dados.');
        }
        const destinationId = destinationRows[0].id;

        // Orçamento por categoria (conservador)
        const accommodationBudget = budget * 0.35;
        const transportBudget = budget * 0.20;
        const localTransportBudget = budget * 0.05;
        const foodAndActivitiesBudget = budget * 0.40; // agora combinado

        // ===============================================
        // 1. ACOMODAÇÃO — ORDENA POR PREÇO BASEADO NO ORÇAMENTO
        // ===============================================
        if (numberOfNights > 0) {
            const accommodationPrefs = userPreferences['accommodation_preferences'] || [];
            let accommodationQuery = `
                SELECT h.id, h.nome, h.endereco, h.cidade, h.categoria, ho.preco
                FROM hospedagem h
                JOIN hoteis ho ON h.id = ho.id_hospedagem
                WHERE h.cidade = ?`;
            const accommodationParams: any[] = [destinationName];
            
            if (accommodationPrefs.length > 0) {
                const placeholders = accommodationPrefs.map(() => '?').join(',');
                accommodationQuery += ` AND h.categoria IN (${placeholders})`;
                accommodationParams.push(...accommodationPrefs);
            }
            
            // ✅ Se orçamento alto, pega opções mais caras
            const orderDir = budget > 2000 ? 'DESC' : 'ASC';
            accommodationQuery += ` ORDER BY ho.preco ${orderDir}`;

            const [accommodations]: any = await connection.query(accommodationQuery, accommodationParams);
            if (accommodations.length > 0) {
                let selectedAccommodation = null;
                if (budget > 2000) {
                    // Pegar o mais caro que caiba no orçamento
                    for (const acc of accommodations) {
                        if (parseFloat(acc.preco) * numberOfNights <= accommodationBudget * 1.2) {
                            selectedAccommodation = acc;
                            break;
                        }
                    }
                } else {
                    // Pegar o mais barato que atenda
                    selectedAccommodation = accommodations[0];
                }
                if (!selectedAccommodation) selectedAccommodation = accommodations[0];
                generatedPackage.items.accommodation = selectedAccommodation;
            }
        }

        // ===============================================
        // 2. TRANSPORTE PARA O DESTINO
        // ===============================================
        const destTransportPrefs = userPreferences['destination_transport_preferences'] || [];
        let transportQuery = `
            SELECT t.id, t.tipo, t.descricao,
                   COALESCE(do.preco, da.preco) AS preco_estimado
            FROM transporte_para_cidade t
            LEFT JOIN detalhes_onibus do ON t.id = do.id_transporte
            LEFT JOIN detalhes_avioes da ON t.id = da.id_transporte
            WHERE t.cidade_destino = ?`;
        const transportParams: any[] = [destinationName];
        if (destTransportPrefs.length > 0) {
            const placeholders = destTransportPrefs.map(() => '?').join(',');
            transportQuery += ` AND t.tipo IN (${placeholders})`;
            transportParams.push(...destTransportPrefs);
        }
        transportQuery += ` ORDER BY COALESCE(do.preco, da.preco) ASC`;

        const [transports]: any = await connection.query(transportQuery, transportParams);
        if (transports.length > 0) {
            const selectedTransport = transports[0];
            generatedPackage.items.destinationTransport = selectedTransport;
        }

        // ===============================================
        // 3. TRANSPORTE LOCAL
        // ===============================================
        const localTransportPrefs = userPreferences['local_transport_preferences'] || [];
        let localTransportQuery = `
            SELECT tl.id, tl.tipo, tl.descricao, tl.preco
            FROM transporte_local tl
            WHERE tl.cidade = ?`;
        const localTransportParams: any[] = [destinationName];
        if (localTransportPrefs.length > 0) {
            const placeholders = localTransportPrefs.map(() => '?').join(',');
            localTransportQuery += ` AND tl.tipo IN (${placeholders})`;
            localTransportParams.push(...localTransportPrefs);
        }
        localTransportQuery += ` ORDER BY tl.preco ASC`;

        const [localTransports]: any = await connection.query(localTransportQuery, localTransportParams);
        if (localTransports.length > 0) {
            generatedPackage.items.localTransport = localTransports[0];
        }

        // ===============================================
        // 4. ALIMENTAÇÃO — ✅ GERA QUANTIDADE COMPLETA DE REFEIÇÕES
        // ===============================================
        const foodPrefs = userPreferences['food_preferences'] || [];
        const mealsPerDay = 3; // café, almoço, jantar
        const totalMealsNeeded = numberOfDays * mealsPerDay; // total de refeições (não por pessoa)

        if (foodPrefs.length > 0 && totalMealsNeeded > 0) {
            let foodQuery = `
                SELECT id, tipo, descricao, cidade, preco, categoria
                FROM alimentacoes
                WHERE id_destino = ?`;
            const foodParams: any[] = [destinationId];
            const placeholders = foodPrefs.map(() => '?').join(',');
            foodQuery += ` AND categoria IN (${placeholders})`;
            
            // ✅ Ordem por preço (mais caro se budget alto)
            const foodOrder = budget > 2000 ? 'DESC' : 'ASC';
            foodQuery += ` ORDER BY preco ${foodOrder}`;

            foodParams.push(...foodPrefs);

            const [allFoodItems]: any = await connection.query(foodQuery, foodParams);
            if (allFoodItems.length > 0) {
                const selectedFoodItems = [];
                let foodCost = 0;
                let mealsAdded = 0;

                // Repetir itens até preencher todas as refeições
                while (mealsAdded < totalMealsNeeded) {
                    let addedThisRound = false;
                    for (const item of allFoodItems) {
                        if (mealsAdded >= totalMealsNeeded) break;
                        const costForGroup = parseFloat(item.preco || '0') * totalPeople;
                        if (foodCost + costForGroup <= foodAndActivitiesBudget * 0.6) {
                            selectedFoodItems.push(item);
                            foodCost += costForGroup;
                            mealsAdded++;
                            addedThisRound = true;
                        }
                    }
                    if (!addedThisRound) break; // evita loop infinito
                }
                generatedPackage.items.food = selectedFoodItems;
            }
        }

        // ===============================================
        // 5. ATIVIDADES
        // ===============================================
        const activityPrefs = userPreferences['activity_preferences'] || [];
        if (activityPrefs.length > 0) {
            let activitiesQuery = `
                SELECT id, nome, descricao, preco, categoria
                FROM atividades
                WHERE cidade = ? AND preco >= 0`;
            let activitiesParams: any[] = [destinationName];
            const placeholders = activityPrefs.map(() => '?').join(',');
            activitiesQuery += ` AND categoria IN (${placeholders})`;
            
            const actOrder = budget > 2000 ? 'DESC' : 'ASC';
            activitiesQuery += ` ORDER BY preco ${actOrder}`;
            activitiesParams.push(...activityPrefs);

            const [activities]: any = await connection.query(activitiesQuery, activitiesParams);
            if (activities.length > 0) {
                const selectedActivities = [];
                let activitiesCost = 0;
                const maxActBudget = foodAndActivitiesBudget * 0.4;
                for (const act of activities) {
                    const cost = parseFloat(act.preco || '0') * totalPeople;
                    if (activitiesCost + cost <= maxActBudget) {
                        selectedActivities.push(act);
                        activitiesCost += cost;
                    }
                }
                generatedPackage.items.activities = selectedActivities;
            }
        }

        // Interesses e Eventos (básico)
        const interestPrefs = userPreferences['interests'] || [];
        if (interestPrefs.length > 0) {
            let interestsQuery = `
                SELECT id, nome, descricao, preco, categoria
                FROM interesses
                WHERE cidade = ?`;
            let interestsParams: any[] = [destinationName];
            const placeholders = interestPrefs.map(() => '?').join(',');
            interestsQuery += ` AND categoria IN (${placeholders})`;
            interestsQuery += ` ORDER BY preco ASC`;
            interestsParams.push(...interestPrefs);

            const [interests]: any = await connection.query(interestsQuery, interestsParams);
            generatedPackage.items.interests = interests.slice(0, 3);
        }

        const eventPrefs = userPreferences['activity_preferences']?.filter(p => 
            ['Shows/Eventos', 'Vida Noturna/Baladas', 'Cinema/Teatro'].includes(p)
        ) || [];
        if (eventPrefs.length > 0) {
            const sqlDateIn = `${dateInObj.getFullYear()}-${(dateInObj.getMonth() + 1).toString().padStart(2, '0')}-${dateInObj.getDate().toString().padStart(2, '0')}`;
            const sqlDateOut = `${dateOutObj.getFullYear()}-${(dateOutObj.getMonth() + 1).toString().padStart(2, '0')}-${dateOutObj.getDate().toString().padStart(2, '0')}`;

            let eventsQuery = `
                SELECT id, nome, descricao, preco, data_hora, categoria
                FROM eventos
                WHERE id_destino = ? AND data_hora BETWEEN ? AND ?`;
            let eventsParams = [destinationId, sqlDateIn, sqlDateOut];
            const placeholders = eventPrefs.map(() => '?').join(',');
            eventsQuery += ` AND categoria IN (${placeholders})`;
            eventsQuery += ` ORDER BY preco DESC LIMIT 3`;
            eventsParams.push(...eventPrefs);

            const [events]: any = await connection.query(eventsQuery, eventsParams);
            generatedPackage.items.events = events;
        }

        // ===============================================
        // CÁLCULO FINAL DO CUSTO
        // ===============================================
        let totalCost = 0;
        if (generatedPackage.items.accommodation) {
            totalCost += calculateItemTotalCost(generatedPackage.items.accommodation, 'accommodation', numberOfNights, numberOfDays, totalPeople);
        }
        if (generatedPackage.items.destinationTransport) {
            totalCost += calculateItemTotalCost(generatedPackage.items.destinationTransport, 'destinationTransport', numberOfNights, numberOfDays, totalPeople);
        }
        if (generatedPackage.items.localTransport) {
            totalCost += calculateItemTotalCost(generatedPackage.items.localTransport, 'localTransport', numberOfNights, numberOfDays, totalPeople);
        }
        totalCost += calculateArrayTotal(generatedPackage.items.food, 'food', numberOfNights, numberOfDays, totalPeople);
        totalCost += calculateArrayTotal(generatedPackage.items.activities, 'activity', numberOfNights, numberOfDays, totalPeople);
        totalCost += calculateArrayTotal(generatedPackage.items.interests, 'interest', numberOfNights, numberOfDays, totalPeople);
        totalCost += calculateArrayTotal(generatedPackage.items.events, 'event', numberOfNights, numberOfDays, totalPeople);

        // ✅ DEFINIR TOTAL SEM FORÇAR VALOR MÍNIMO
        generatedPackage.totalCost = parseFloat(totalCost.toFixed(2));

        console.log(`\n🎉 PACOTE FINALIZADO:`);
        console.log(`   Orçamento (slider): R$ ${budget}`);
        console.log(`   Custo real: R$ ${generatedPackage.totalCost}`);
        console.log(`   Uso: ${((generatedPackage.totalCost / budget) * 100).toFixed(1)}%`);
        console.log(`   Refeições incluídas: ${generatedPackage.items.food.length}`);

        return generatedPackage;

    } catch (error) {
        console.error('Erro ao gerar pacote de viagem:', error);
        throw error;
    } finally {
        connection.release();
    }
};