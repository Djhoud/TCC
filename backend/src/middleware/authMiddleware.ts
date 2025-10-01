// backend/src/middleware/authMiddleware.ts
import { NextFunction, Request, RequestHandler, Response } from 'express';
import jwt from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_se_nao_encontrar_no_env';

const verifyToken: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Token ausente ou formato inválido.' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
    req.userId = decoded.id;
    next();
  } catch (error) {
    console.error('Token inválido ou expirado:', error);
    res.status(401).json({ message: 'Token inválido ou expirado.' });
  }
};
export default verifyToken;