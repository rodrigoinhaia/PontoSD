import { Request, Response, NextFunction } from 'express';
import { corsMiddleware } from '../../middlewares/cors.middleware';
import { logger } from '../../utils/logger';

jest.mock('../../utils/logger');

describe('CORS Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      headers: {},
    };
    mockRes = {
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
      end: jest.fn(),
    };
    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should allow requests from allowed origins', () => {
    mockReq.headers = {
      origin: 'http://localhost:3000',
    };

    corsMiddleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Origin', 'http://localhost:3000');
    expect(mockRes.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH');
    expect(mockRes.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    expect(mockRes.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Credentials', 'true');
    expect(mockRes.setHeader).toHaveBeenCalledWith('Access-Control-Max-Age', '86400');
  });

  it('should block requests from disallowed origins', () => {
    mockReq.headers = {
      origin: 'http://malicious-site.com',
    };

    corsMiddleware(mockReq as Request, mockRes as Response, mockNext);

    expect(logger.warn).toHaveBeenCalledWith('Tentativa de acesso de origem não permitida: http://malicious-site.com');
    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.end).toHaveBeenCalled();
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should allow requests without origin header', () => {
    mockReq.headers = {};

    corsMiddleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Origin', '*');
  });

  it('should handle preflight requests', () => {
    mockReq.method = 'OPTIONS';
    mockReq.headers = {
      origin: 'http://localhost:3000',
      'access-control-request-method': 'POST',
    };

    corsMiddleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(204);
    expect(mockRes.end).toHaveBeenCalled();
    expect(mockNext).not.toHaveBeenCalled();
  });
}); 