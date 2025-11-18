import { Request, Response, Router } from 'express';
import verifyToken from '../middleware/authMiddleware';
import { findAlternatives } from '../services/alternativeService';

const router = Router();

// Rota para buscar alternativas
router.post('/:type', verifyToken, async (req: Request, res: Response) => {
    try {
        const { type } = req.params;
        const { currentItem, destination, budget, travelData } = req.body;
        
        console.log('Buscando alternativas para:', { type, destination, budget });
        
        // Busca alternativas do banco
        const alternatives = await findAlternatives(
            type, 
            currentItem, 
            destination, 
            budget, 
            travelData
        );
        
        res.json({ 
            success: true,
            alternatives 
        });
        
    } catch (error) {
        console.error('Erro ao buscar alternativas:', error);
        res.status(500).json({ 
            success: false,
            message: 'Erro interno ao buscar alternativas' 
        });
    }
});

export default router;