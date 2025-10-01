// backend/src/routes/profileRoutes.ts
import { Request, Response, Router } from 'express';
import verifyToken from '../middleware/authMiddleware';
import { getUserById, getUserTravelHistory } from '../services/userService';
import asyncHandler from '../utils/asyncHandler';

const router = Router();

interface AuthRequest extends Request {
  userId?: number;
}

// 🔹 Rota: Perfil do usuário logado
router.get('/profile', verifyToken, asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ message: 'Não autorizado. ID do usuário ausente.' });
  }

  const user = await getUserById(userId);

  if (!user) {
    return res.status(404).json({ message: 'Usuário não encontrado.' });
  }

  res.json(user);
}));

// 🔹 Rota: Histórico de viagens do usuário logado
router.get('/history', verifyToken, asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ message: 'Não autorizado. ID do usuário ausente.' });
  }

  const travels = await getUserTravelHistory(userId);

  res.status(200).json(travels);
}));

export default router;
