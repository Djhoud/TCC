// package-routes.ts
import { Request, Response, Router } from 'express';
import { db } from '../database';
import verifyToken from '../middleware/authMiddleware';
import asyncHandler from '../utils/asyncHandler';

const router = Router();

// Função auxiliar para mapear categorias de preferência para tabelas do DB
const preferenceToTableMap: { [key: string]: string } = {
    'accommodation_preferences': 'hospedagem',
    'food_preferences': 'alimentacoes',
    'local_transport_preferences': 'transporte_local',
    'destination_transport_preferences': 'transporte_para_cidade',
    'activity_preferences': 'atividades',
    'interests': 'interesses',
};

// @route   POST /api/packages/generate
// @desc    Gera um pacote de viagem personalizado com base nas preferências e orçamento
// @access  Private (requer autenticação)
router.post('/generate', verifyToken, asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId;
    const { orcamento, destino } = req.body;

    if (!userId || !orcamento || !destino) {
        return res.status(400).json({ message: 'Dados inválidos: orçamento e destino são obrigatórios.' });
    }

    const connection = await db.getConnection();
    try {
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

        const [destinationRows]: any = await connection.query(
            'SELECT id FROM destinos WHERE nome = ?',
            [destino]
        );
        if (destinationRows.length === 0) {
            return res.status(404).json({ message: 'Destino não encontrado.' });
        }
        const destinationId = destinationRows[0].id;

        const generatedPackage: any = {
            destination: destino,
            budget: orcamento,
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

        // Lógica para selecionar Acomodação
        const accommodationPrefs = userPreferences['accommodation_preferences'] || [];
        if (accommodationPrefs.length > 0) {
            const placeholders = accommodationPrefs.map(() => '?').join(',');
            const [accommodations]: any = await connection.query(
                `SELECT h.id, h.nome, h.endereco, h.cidade, h.categoria, ho.preco
                 FROM hospedagem h
                 JOIN hoteis ho ON h.id = ho.id_hospedagem
                 WHERE h.cidade = ? AND h.categoria IN (${placeholders})
                 AND ho.preco <= ? ORDER BY RAND() LIMIT 1`,
                [destino, ...accommodationPrefs, orcamento * 0.4]
            );
            if (accommodations.length > 0) {
                generatedPackage.items.accommodation = accommodations[0];
                currentTotalCost += parseFloat(accommodations[0].preco);
            }
        }

        // Lógica para selecionar Alimentação (Múltiplos itens)
        const foodPrefs = userPreferences['food_preferences'] || [];
        if (foodPrefs.length > 0) {
            const placeholders = foodPrefs.map(() => '?').join(',');
            const [foodOptions]: any = await connection.query(
                `SELECT id, tipo, descricao, cidade, preco, categoria
                 FROM alimentacoes
                 WHERE id_destino = ? AND categoria IN (${placeholders})
                 AND preco <= ? ORDER BY RAND() LIMIT 3`,
                [destinationId, ...foodPrefs, orcamento * 0.15]
            );
            generatedPackage.items.food = foodOptions;
            foodOptions.forEach((f: any) => currentTotalCost += parseFloat(f.preco));
        }

        // Lógica para selecionar Transporte para o Destino (ida e volta)
        const destTransportPrefs = userPreferences['destination_transport_preferences'] || [];
        if (destTransportPrefs.length > 0) {
            const placeholders = destTransportPrefs.map(() => '?').join(',');
            const [transports]: any = await connection.query(
                `SELECT t.id, t.tipo, t.descricao,
                        COALESCE(do.preco, da.preco) AS preco_estimado
                 FROM transporte_para_cidade t
                 LEFT JOIN detalhes_onibus do ON t.id = do.id_transporte
                 LEFT JOIN detalhes_avioes da ON t.id = da.id_transporte
                 WHERE t.cidade_destino = ? AND t.tipo IN (${placeholders})
                 AND COALESCE(do.preco, da.preco) <= ? ORDER BY RAND() LIMIT 1`,
                [destino, ...destTransportPrefs, orcamento * 0.3]
            );
            if (transports.length > 0) {
                generatedPackage.items.destinationTransport = transports[0];
                currentTotalCost += parseFloat(transports[0].preco_estimado) * 2;
            }
        }

        // Lógica para selecionar Transporte Local
        const localTransportPrefs = userPreferences['local_transport_preferences'] || [];
        if (localTransportPrefs.length > 0) {
            const placeholders = localTransportPrefs.map(() => '?').join(',');
            const [localTransports]: any = await connection.query(
                `SELECT id, tipo, descricao, preco
                 FROM transporte_local
                 WHERE cidade = ? AND tipo IN (${placeholders})
                 AND preco <= ? ORDER BY RAND() LIMIT 1`,
                [destino, ...localTransportPrefs, orcamento * 0.05]
            );
            if (localTransports.length > 0) {
                generatedPackage.items.localTransport = localTransports[0];
                currentTotalCost += parseFloat(localTransports[0].preco);
            }
        }

        // Lógica para selecionar Atividades e Interesses (múltiplos itens)
        const activityPrefs = userPreferences['activity_preferences'] || [];
        const interestPrefs = userPreferences['interests'] || [];
        const combinedPrefs = [...activityPrefs, ...interestPrefs];

        if (combinedPrefs.length > 0) {
            const placeholders = combinedPrefs.map(() => '?').join(',');
            const [activities]: any = await connection.query(
                `SELECT id, nome, descricao, preco, categoria
                 FROM atividades
                 WHERE cidade = ? AND categoria IN (${placeholders})
                 AND preco <= ? ORDER BY RAND() LIMIT 3`,
                [destino, ...combinedPrefs, orcamento * 0.1]
            );
            generatedPackage.items.activities = activities;
            activities.forEach((a: any) => currentTotalCost += parseFloat(a.preco));

            const [interests]: any = await connection.query(
                `SELECT id, nome, descricao, preco, categoria
                 FROM interesses
                 WHERE cidade = ? AND categoria IN (${placeholders})
                 AND preco <= ? ORDER BY RAND() LIMIT 3`,
                [destino, ...combinedPrefs, orcamento * 0.05]
            );
            generatedPackage.items.interests = interests;
            interests.forEach((i: any) => currentTotalCost += parseFloat(i.preco));
        }

        // Lógica para selecionar Eventos
        const eventPrefs = userPreferences['activity_preferences']?.filter(p => p === 'Shows/Eventos' || p === 'Vida Noturna/Baladas' || p === 'Cinema/Teatro') || [];
        if (eventPrefs.length > 0) {
            const placeholders = eventPrefs.map(() => '?').join(',');
            const [events]: any = await connection.query(
                `SELECT id, nome, descricao, preco, data_hora, categoria
                 FROM eventos
                 WHERE id_destino = ? AND categoria IN (${placeholders})
                 AND preco <= ? ORDER BY RAND() LIMIT 1`,
                [destinationId, ...eventPrefs, orcamento * 0.05]
            );
            generatedPackage.items.events = events;
            events.forEach((e: any) => currentTotalCost += parseFloat(e.preco));
        }

        generatedPackage.totalCost = Number(currentTotalCost);

        res.status(200).json({
            message: 'Pacote gerado com sucesso!',
            package: generatedPackage,
            userPreferences: userPreferences
        });

    } catch (error) {
        console.error('Erro ao gerar pacote:', error);
        res.status(500).json({ message: 'Erro interno no servidor ao gerar pacote.' });
    } finally {
        connection.release();
    }
}));

export default router;