// Arquivo: backend/src/middleware/authMiddleware.ts
import { NextFunction, Request, RequestHandler, Response } from 'express';
import jwt from 'jsonwebtoken';

// Esta declaração global é perfeita!
declare global {
  namespace Express {
    interface Request {
      userId?: number; // Agora userId é uma propriedade opcional em QUALQUER Request
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_se_nao_encontrar_no_env';

const verifyToken: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Não autorizado, nenhum token fornecido ou formato inválido.' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
    req.userId = decoded.id; // Aqui, você garante que userId é setado
    next();
  } catch (error) {
    console.error('Erro na verificação do token:', error);
    res.status(403).json({ message: 'Não autorizado, token inválido ou expirado.' });
    return;
  }
};

export default verifyToken;