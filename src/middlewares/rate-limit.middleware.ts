import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { logger } from '../utils/logger';

// Limite para rotas de autenticação (mais restritivo)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 tentativas por IP
  message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
  handler: (req: Request, res: Response) => {
    logger.warn(`Rate limit excedido para IP ${req.ip} na rota ${req.path}`);
    res.status(429).json({
      message: 'Muitas tentativas. Tente novamente em 15 minutos.',
    });
  },
});

// Limite para rotas comuns
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requisições por IP
  message: 'Muitas requisições. Tente novamente em 15 minutos.',
  handler: (req: Request, res: Response) => {
    logger.warn(`Rate limit excedido para IP ${req.ip} na rota ${req.path}`);
    res.status(429).json({
      message: 'Muitas requisições. Tente novamente em 15 minutos.',
    });
  },
});

// Limite para rotas de relatórios (mais restritivo)
export const reportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 20, // 20 requisições por IP
  message: 'Muitas requisições de relatórios. Tente novamente em 1 hora.',
  handler: (req: Request, res: Response) => {
    logger.warn(`Rate limit excedido para IP ${req.ip} na rota ${req.path}`);
    res.status(429).json({
      message: 'Muitas requisições de relatórios. Tente novamente em 1 hora.',
    });
  },
}); 