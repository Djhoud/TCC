import express from 'express';
import {
    getCitiesController,
    getCityDetailsController
} from '../controllers/cityController';

const router = express.Router();

// 1. Rota para buscar sugestões de cidades (Autocompletar)
router.get('/cities/suggestions', getCitiesController);

// 2. NOVA ROTA: Rota para buscar detalhes de uma cidade específica (incluindo orçamento)
router.get('/cities/details', getCityDetailsController);

export default router;