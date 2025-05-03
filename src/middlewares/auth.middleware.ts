import { NextFunction, Request, Response } from 'express';
import { User } from '../models/user.model';
import { logger } from '../utils/logger';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  id: number;
  email: string;
  iat: number;
  exp: number;
}

interface RequestWithUser extends Request {
  user?: User;
}

export const protect = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Token não fornecido',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Usuário não encontrado',
      });
    }

    if (!user.active) {
      return res.status(401).json({
        status: 'error',
        message: 'Usuário inativo',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error('Erro na autenticação:', error);
    return res.status(401).json({
      status: 'error',
      message: 'Token inválido',
    });
  }
};

export const restrictTo = (...roles: string[]) => {
  return (req: RequestWithUser, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'Você não tem permissão para realizar esta ação',
      });
    }

    next();
  };
}; 