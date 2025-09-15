// backend/src/routes/preferencesRoutes.ts
import { Request, Response, Router } from 'express';
import { db } from '../database';
import verifyToken from '../middleware/authMiddleware';
import { getBudgetRangeForCategory } from '../services/packageGeneratorService'; // Importe a nova função
import asyncHandler from '../utils/asyncHandler';

const router = Router();

// @route   POST /api/preferences/save
// @desc    Salvar as preferências do usuário
// @access  Private (requer autenticação)
router.post('/save', verifyToken, asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId;
    const { preferences } = req.body;

    if (!userId || !preferences || typeof preferences !== 'object') {
        return res.status(400).json({ message: 'Dados inválidos. ID do usuário ou preferências ausentes.' });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        await connection.query('DELETE FROM preferencias_usuario WHERE id_usuario = ?', [userId]);

        for (const categoryField in preferences) {
            const selectedOptions: string[] = preferences[categoryField];

            if (Array.isArray(selectedOptions) && selectedOptions.length > 0) {
                for (const optionDesc of selectedOptions) {
                    const [optionRows]: any = await connection.query(
                        'SELECT id FROM opcoes_preferencia WHERE categoria = ? AND descricao = ?',
                        [categoryField, optionDesc]
                    );

                    if (optionRows.length > 0) {
                        const optionId = optionRows[0].id;
                        await connection.query(
                            'INSERT INTO preferencias_usuario (id_usuario, id_opcao) VALUES (?, ?)',
                            [userId, optionId]
                        );
                    } else {
                        console.warn(`Opção de preferência não encontrada no banco de dados: Categoria: ${categoryField}, Descrição: ${optionDesc}`);
                    }
                }
            }
        }

        await connection.query('UPDATE usuarios SET preferencias_completas = TRUE WHERE id = ?', [userId]);

        await connection.commit();
        res.status(200).json({ message: 'Preferências salvas com sucesso!' });

    } catch (error) {
        await connection.rollback();
        console.error('Erro ao salvar preferências:', error);
        throw error;
    } finally {
        connection.release();
    }
}));


// @route   GET /api/preferences/user
// @desc    Obter as preferências do usuário autenticado
// @access  Private (requer autenticação)
router.get('/user', verifyToken, asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId;

    if (!userId) {
        return res.status(400).json({ message: 'ID do usuário não fornecido.' });
    }

    const connection = await db.getConnection();
    try {
        const [preferencesRows]: any = await connection.query(
            `SELECT op.categoria, op.descricao
             FROM preferencias_usuario pu
             JOIN opcoes_preferencia op ON pu.id_opcao = op.id
             WHERE pu.id_usuario = ?`,
            [userId]
        );

        const userPreferences: { [key: string]: string[] } = {};
        preferencesRows.forEach((row: { categoria: string; descricao: string }) => {
            if (!userPreferences[row.categoria]) {
                userPreferences[row.categoria] = [];
            }
            userPreferences[row.categoria].push(row.descricao);
        });

        res.status(200).json({ preferences: userPreferences });

    } catch (error) {
        console.error('Erro ao buscar preferências do usuário:', error);
        throw error;
    } finally {
        connection.release();
    }
}));


// @route   GET /api/preferences/status
// @desc    Verificar se o usuário já completou as preferências (alternativa ao retorno no login)
// @access  Private (requer autenticação)
router.get('/status', verifyToken, asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId;

    if (!userId) {
        return res.status(400).json({ message: 'ID do usuário não fornecido.' });
    }

    const connection = await db.getConnection();
    try {
        const [rows]: any = await connection.query(
            'SELECT preferencias_completas FROM usuarios WHERE id = ?',
            [userId]
        );

        const hasCompletedPreferences = rows.length > 0 ? rows[0].preferencias_completas : false;

        res.status(200).json({ hasCompletedPreferences });

    } catch (error) {
        console.error('Erro ao buscar status de preferências:', error);
        throw error;
    } finally {
        connection.release();
    }
}));

// @route   GET /api/preferences/budget-range
// @desc    Obter o range de orçamento min/max estimado para um destino e preferências
// @access  Private (requer autenticação)
router.get('/budget-range', verifyToken, asyncHandler(async (req: Request, res: Response) => {
    console.log("--- DEBUG BACKEND BUDGET RANGE ---");
    const userId = req.userId;
    const { destinationName } = req.query;

    if (!userId) {
        return res.status(401).json({ message: "Usuário não autenticado." });
    }
    if (!destinationName || typeof destinationName !== 'string') {
        return res.status(400).json({ message: "Nome do destino é obrigatório e deve ser uma string." });
    }

    const connection = await db.getConnection();
    try {
        const { minBudget, maxBudget } = await getBudgetRangeForCategory(
            userId,
            destinationName,
            connection
        );

        res.status(200).json({ minBudget, maxBudget });

    } catch (error) {
        console.error('Erro ao calcular range de orçamento na rota:', error);
        throw error;
    } finally {
        connection.release();
    }
}));

export default router;