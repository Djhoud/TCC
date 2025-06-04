// backend/src/routes/cityRoutes.ts
import express from 'express';
import { getCities } from '../controllers/cityController'; // Você precisará criar este controller

const router = express.Router();

router.get('/cities', getCities); // Endpoint para buscar todas as cidades ou cidades filtradas
// Se quiser um endpoint para buscar sugestões por texto (autocompletar)
router.get('/cities/suggestions', getCities); // Pode usar o mesmo controller ou um específico

export default router;