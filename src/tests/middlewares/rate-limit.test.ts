import { Request, Response, NextFunction } from 'express';
import { authLimiter, apiLimiter, reportLimiter } from '../../middlewares/rate-limit.middleware';
import { logger } from '../../utils/logger';

jest.mock('../../utils/logger');

describe('Rate Limit Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      ip: '127.0.0.1',
      path: '/test',
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Auth Limiter', () => {
    it('should allow requests within limit', async () => {
      for (let i = 0; i < 5; i++) {
        await authLimiter(mockReq as Request, mockRes as Response, mockNext);
        expect(mockNext).toHaveBeenCalled();
      }
    });

    it('should block requests exceeding limit', async () => {
      for (let i = 0; i < 6; i++) {
        await authLimiter(mockReq as Request, mockRes as Response, mockNext);
      }

      expect(mockRes.status).toHaveBeenCalledWith(429);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Muitas tentativas. Tente novamente em 15 minutos.',
      });
      expect(logger.warn).toHaveBeenCalled();
    });
  });

  describe('API Limiter', () => {
    it('should allow requests within limit', async () => {
      for (let i = 0; i < 100; i++) {
        await apiLimiter(mockReq as Request, mockRes as Response, mockNext);
        expect(mockNext).toHaveBeenCalled();
      }
    });

    it('should block requests exceeding limit', async () => {
      for (let i = 0; i < 101; i++) {
        await apiLimiter(mockReq as Request, mockRes as Response, mockNext);
      }

      expect(mockRes.status).toHaveBeenCalledWith(429);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Muitas requisições. Tente novamente em 15 minutos.',
      });
      expect(logger.warn).toHaveBeenCalled();
    });
  });

  describe('Report Limiter', () => {
    it('should allow requests within limit', async () => {
      for (let i = 0; i < 20; i++) {
        await reportLimiter(mockReq as Request, mockRes as Response, mockNext);
        expect(mockNext).toHaveBeenCalled();
      }
    });

    it('should block requests exceeding limit', async () => {
      for (let i = 0; i < 21; i++) {
        await reportLimiter(mockReq as Request, mockRes as Response, mockNext);
      }

      expect(mockRes.status).toHaveBeenCalledWith(429);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Muitas requisições de relatórios. Tente novamente em 1 hora.',
      });
      expect(logger.warn).toHaveBeenCalled();
    });
  });
}); 