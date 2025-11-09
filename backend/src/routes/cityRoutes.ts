import { Router } from 'express';
import * as cityController from '../controllers/cityController';
import authenticateToken from '../middleware/authMiddleware';

const router = Router();

// Rota para sugestões de cidades (usada no campo de busca)
router.get('/suggestions', authenticateToken, cityController.getCitiesController);

// Rota para obter detalhes DIÁRIOS da cidade (custo base por dia)
router.get('/details', authenticateToken, cityController.getCityDailyDetailsController);

// Rota para calcular o ORÇAMENTO TOTAL do pacote (usa numPeople e numDays)
router.get('/package', authenticateToken, cityController.calculatePackageBudgetController);

export default router;