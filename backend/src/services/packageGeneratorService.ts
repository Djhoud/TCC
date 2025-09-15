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
  // Opcional: Para depuração, pode incluir as preferências que foram usadas
  userPreferencesApplied?: { [key: string]: string[] };
}

// Função auxiliar para mapear categorias de preferência para tabelas do DB (se necessário para a lógica do serviço)
// const preferenceToTableMap: { [key: string]: string } = {
//   'accommodation_preferences': 'hospedagem',
//   'food_preferences': 'alimentacoes',
//   'local_transport_preferences': 'transporte_local',
//   'destination_transport_preferences': 'transporte_para_cidade',
//   'activity_preferences': 'atividades',
//   'interests': 'interesses',
// };

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

    let currentTotalCost = 0;

    // --- 0. Calcular Duração da Viagem (em dias/noites) ---
    const parseDate = (dateStr: string) => {
        const [day, month, year] = dateStr.split('/').map(Number);
        const fullYear = year < 100 ? 2000 + year : year;
        return new Date(fullYear, month - 1, day);
    };

    const dateInObj = parseDate(dateIn);
    const dateOutObj = parseDate(dateOut);
    const timeDiff = Math.abs(dateOutObj.getTime() - dateInObj.getTime());
    const numberOfNights = Math.ceil(timeDiff / (1000 * 3600 * 24));
    // Se a data de ida e volta são as mesmas, significa 0 noites, mas 1 dia. Ajuste conforme sua regra de negócio.
    // Para simplificar, vou garantir pelo menos 1 noite se as datas forem diferentes.
    const actualNights = numberOfNights === 0 && dateIn !== dateOut ? 1 : numberOfNights;
    const numberOfDays = actualNights + 1; // Dias totais

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
    generatedPackage.userPreferencesApplied = userPreferences; // Para depuração


    // 2. Obter o ID do destino
    const [destinationRows]: any = await connection.query(
      'SELECT id FROM destinos WHERE nome = ?',
      [destinationName]
    );
    if (destinationRows.length === 0) {
      throw new Error('Destino não encontrado no banco de dados.');
    }
    const destinationId = destinationRows[0].id;


    // --- Lógica para selecionar Acomodação ---
    // Aloca 40% do orçamento total por pessoa por noite para hospedagem
    const budgetForAccommodationPerPersonPerNight = (budget * 0.4) / (adults + children) / actualNights;
    const accommodationPrefs = userPreferences['accommodation_preferences'] || [];
    let accommodationQuery = `
        SELECT h.id, h.nome, h.endereco, h.cidade, h.categoria, ho.preco
        FROM hospedagem h
        JOIN hoteis ho ON h.id = ho.id_hospedagem
        WHERE h.cidade = ? AND ho.preco <= ?`;

    const accommodationParams = [destinationName, budgetForAccommodationPerPersonPerNight];

    if (accommodationPrefs.length > 0) {
        const placeholders = accommodationPrefs.map(() => '?').join(',');
        accommodationQuery += ` AND h.categoria IN (${placeholders})`;
        accommodationParams.push(...accommodationPrefs);
    }
    accommodationQuery += ` ORDER BY RAND() LIMIT 1`;

    const [accommodations]: any = await connection.query(accommodationQuery, accommodationParams);

    if (accommodations.length > 0) {
        generatedPackage.items.accommodation = accommodations[0];
        currentTotalCost += parseFloat(accommodations[0].preco) * actualNights * (adults + children); // Custo total da hospedagem para o grupo e noites
    }


    // --- Lógica para selecionar Alimentação (Múltiplos itens) ---
    // Aloca 15% do orçamento total por pessoa por dia para alimentação
    const budgetForFoodPerPersonPerDay = (budget * 0.15) / (adults + children) / numberOfDays;
    const foodPrefs = userPreferences['food_preferences'] || [];
    let foodQuery = `
        SELECT id, tipo, descricao, cidade, preco, categoria
        FROM alimentacoes
        WHERE id_destino = ? AND preco <= ?`;
    const foodParams = [destinationId, budgetForFoodPerPersonPerDay];

    if (foodPrefs.length > 0) {
        const placeholders = foodPrefs.map(() => '?').join(',');
        foodQuery += ` AND categoria IN (${placeholders})`;
        foodParams.push(...foodPrefs);
    }
    foodQuery += ` ORDER BY RAND() LIMIT 3`; // Tenta 3 opções

    const [foodOptions]: any = await connection.query(foodQuery, foodParams);
    generatedPackage.items.food = foodOptions;
    // Decida se vai somar o custo da alimentação ao total aqui ou se é "por fora" do orçamento.
    // Se for por fora, não adicione ao currentTotalCost. Se for dentro, some.
    // foodOptions.forEach((f: any) => currentTotalCost += f.preco); // Se quiser somar ao custo fixo


    // --- Lógica para selecionar Transporte para o Destino (ida e volta) ---
    // Aloca 30% do orçamento total para transporte de ida e volta para o grupo
    const budgetForDestinationTransportPerPerson = (budget * 0.3) / (adults + children);
    const destTransportPrefs = userPreferences['destination_transport_preferences'] || [];
    let transportQuery = `
        SELECT t.id, t.tipo, t.descricao,
               COALESCE(do.preco, da.preco) AS preco_estimado -- Pega o preço de ônibus ou avião
        FROM transporte_para_cidade t
        LEFT JOIN detalhes_onibus do ON t.id = do.id_transporte
        LEFT JOIN detalhes_avioes da ON t.id = da.id_transporte
        WHERE t.cidade_destino = ? AND COALESCE(do.preco, da.preco) <= ?`;
    const transportParams = [destinationName, budgetForDestinationTransportPerPerson];

    if (destTransportPrefs.length > 0) {
        const placeholders = destTransportPrefs.map(() => '?').join(',');
        transportQuery += ` AND t.tipo IN (${placeholders})`;
        transportParams.push(...destTransportPrefs);
    }
    transportQuery += ` ORDER BY COALESCE(do.preco, da.preco) ASC LIMIT 1`; // Seleciona o mais barato

    const [transports]: any = await connection.query(transportQuery, transportParams);

    if (transports.length > 0) {
        const selectedTransport = transports[0];
        generatedPackage.items.destinationTransport = selectedTransport;
        currentTotalCost += parseFloat(selectedTransport.preco_estimado) * (adults + children) * 2; // Ida e volta para todos
    }


    // --- Lógica para selecionar Transporte Local ---
    // Aloca 5% do orçamento total para transporte local para o grupo (estimativa)
    const budgetForLocalTransportPerPerson = (budget * 0.05) / (adults + children);
    const localTransportPrefs = userPreferences['local_transport_preferences'] || [];
    let localTransportQuery = `
        SELECT tl.id, tl.tipo, tl.descricao, tl.preco, ca.modelo, ca.ano, ca.tipo_combustivel
        FROM transporte_local tl
        LEFT JOIN carros_alugados ca ON tl.id = ca.id_transporte_local
        WHERE tl.cidade = ? AND tl.preco <= ?`;
    const localTransportParams = [destinationName, budgetForLocalTransportPerPerson];

    if (localTransportPrefs.length > 0) {
        const placeholders = localTransportPrefs.map(() => '?').join(',');
        localTransportQuery += ` AND tl.tipo IN (${placeholders})`;
        localTransportParams.push(...localTransportPrefs);
    }
    localTransportQuery += ` ORDER BY RAND() LIMIT 1`;

    const [localTransports]: any = await connection.query(localTransportQuery, localTransportParams);
    if (localTransports.length > 0) {
        generatedPackage.items.localTransport = localTransports[0];
        // currentTotalCost += localTransports[0].preco; // Se for para ser um custo fixo
    }


    // --- Lógica para selecionar Atividades e Interesses (múltiplos itens) ---
    // Aloca 10% do orçamento total por pessoa por dia para atividades
    const budgetForActivitiesPerPersonPerDay = (budget * 0.1) / (adults + children) / numberOfDays;
    const activityPrefs = userPreferences['activity_preferences'] || [];
    const interestPrefs = userPreferences['interests'] || [];
    const combinedActivityInterestPrefs = [...new Set([...activityPrefs, ...interestPrefs])]; // Remove duplicatas

    let activitiesQuery = `
        SELECT id, nome, descricao, preco, categoria
        FROM atividades
        WHERE cidade = ? AND preco <= ?`;
    let activitiesParams = [destinationName, budgetForActivitiesPerPersonPerDay];

    if (combinedActivityInterestPrefs.length > 0) {
        const placeholders = combinedActivityInterestPrefs.map(() => '?').join(',');
        activitiesQuery += ` AND categoria IN (${placeholders})`;
        activitiesParams.push(...combinedActivityInterestPrefs);
    }
    activitiesQuery += ` ORDER BY RAND() LIMIT 3`;

    const [activities]: any = await connection.query(activitiesQuery, activitiesParams);
    generatedPackage.items.activities = activities;
    // activities.forEach((a: any) => currentTotalCost += a.preco); // Se for para ser um custo fixo

    let interestsQuery = `
        SELECT id, nome, descricao, preco, categoria
        FROM interesses
        WHERE cidade = ? AND preco <= ?`;
    let interestsParams = [destinationName, budgetForActivitiesPerPersonPerDay]; // Usar mesmo orçamento para interesses

    if (combinedActivityInterestPrefs.length > 0) {
        const placeholders = combinedActivityInterestPrefs.map(() => '?').join(',');
        interestsQuery += ` AND categoria IN (${placeholders})`;
        interestsParams.push(...combinedActivityInterestPrefs);
    }
    interestsQuery += ` ORDER BY RAND() LIMIT 3`;

    const [interests]: any = await connection.query(interestsQuery, interestsParams);
    generatedPackage.items.interests = interests;
    // interests.forEach((i: any) => currentTotalCost += i.preco); // Se for para ser um custo fixo


    // --- Lógica para selecionar Eventos (se houver e se encaixar no período da viagem) ---
    // Aloca 5% do orçamento total por pessoa por dia para eventos
    const budgetForEventsPerPersonPerDay = (budget * 0.05) / (adults + children) / numberOfDays;
    const eventPrefs = userPreferences['event_preferences'] || []; // Supondo que você terá uma categoria 'event_preferences'
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
    eventsQuery += ` ORDER BY RAND() LIMIT 2`; // Tenta 2 eventos

    const [events]: any = await connection.query(eventsQuery, eventsParams);
    generatedPackage.items.events = events;
    // events.forEach((e: any) => currentTotalCost += e.preco); // Se for para ser um custo fixo


    generatedPackage.totalCost = currentTotalCost; // Custo dos itens "fixos" (hospedagem, transporte ida/volta)

    return generatedPackage;

  } catch (error) {
    console.error('Erro ao gerar pacote de viagem no serviço:', error);
    throw error;
  } finally {
    connection.release();
  }
};