import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { Auditoria } from '../models/auditoria.model';

export const auditMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();

  res.on('finish', async () => {
    try {
      const duration = Date.now() - startTime;
      const userId = req.user?.id;
      const method = req.method;
      const path = req.path;
      const statusCode = res.statusCode;
      const ip = req.ip;
      const userAgent = req.get('user-agent');

      await Auditoria.create({
        userId,
        action: `${method} ${path}`,
        statusCode,
        duration,
        ip,
        userAgent,
        metadata: {
          query: req.query,
          params: req.params,
          body: method !== 'GET' ? req.body : undefined,
        },
      });

      logger.info(`Audit: ${method} ${path} - ${statusCode} - ${duration}ms`);
    } catch (error) {
      logger.error('Erro ao registrar auditoria:', error);
    }
  });

  next();
}; 