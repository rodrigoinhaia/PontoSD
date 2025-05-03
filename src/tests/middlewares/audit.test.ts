import { Request, Response, NextFunction } from 'express';
import { auditMiddleware } from '../../middlewares/audit.middleware';
import { logger } from '../../utils/logger';
import { Auditoria } from '../../models/auditoria.model';

jest.mock('../../utils/logger');
jest.mock('../../models/auditoria.model');

describe('Audit Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      user: { id: 1 },
      method: 'GET',
      path: '/test',
      ip: '127.0.0.1',
      get: jest.fn().mockReturnValue('Mozilla/5.0'),
      query: { page: '1' },
      params: { id: '123' },
      body: { name: 'Test' },
    };
    mockRes = {
      statusCode: 200,
      on: jest.fn(),
    };
    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create audit log for successful request', async () => {
    const mockCreate = jest.fn();
    (Auditoria.create as jest.Mock) = mockCreate;

    await auditMiddleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.on).toHaveBeenCalledWith('finish', expect.any(Function));
    expect(mockNext).toHaveBeenCalled();

    // Simular evento 'finish'
    const finishCallback = (mockRes.on as jest.Mock).mock.calls[0][1];
    await finishCallback();

    expect(mockCreate).toHaveBeenCalledWith({
      userId: 1,
      action: 'GET /test',
      statusCode: 200,
      duration: expect.any(Number),
      ip: '127.0.0.1',
      userAgent: 'Mozilla/5.0',
      metadata: {
        query: { page: '1' },
        params: { id: '123' },
        body: { name: 'Test' },
      },
    });
    expect(logger.info).toHaveBeenCalled();
  });

  it('should create audit log for failed request', async () => {
    const mockCreate = jest.fn();
    (Auditoria.create as jest.Mock) = mockCreate;
    mockRes.statusCode = 500;

    await auditMiddleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.on).toHaveBeenCalledWith('finish', expect.any(Function));
    expect(mockNext).toHaveBeenCalled();

    // Simular evento 'finish'
    const finishCallback = (mockRes.on as jest.Mock).mock.calls[0][1];
    await finishCallback();

    expect(mockCreate).toHaveBeenCalledWith({
      userId: 1,
      action: 'GET /test',
      statusCode: 500,
      duration: expect.any(Number),
      ip: '127.0.0.1',
      userAgent: 'Mozilla/5.0',
      metadata: {
        query: { page: '1' },
        params: { id: '123' },
        body: { name: 'Test' },
      },
    });
    expect(logger.info).toHaveBeenCalled();
  });

  it('should handle errors when creating audit log', async () => {
    const mockCreate = jest.fn().mockRejectedValue(new Error('Database error'));
    (Auditoria.create as jest.Mock) = mockCreate;

    await auditMiddleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.on).toHaveBeenCalledWith('finish', expect.any(Function));
    expect(mockNext).toHaveBeenCalled();

    // Simular evento 'finish'
    const finishCallback = (mockRes.on as jest.Mock).mock.calls[0][1];
    await finishCallback();

    expect(logger.error).toHaveBeenCalledWith('Erro ao registrar auditoria:', expect.any(Error));
  });

  it('should handle requests without user', async () => {
    const mockCreate = jest.fn();
    (Auditoria.create as jest.Mock) = mockCreate;
    delete mockReq.user;

    await auditMiddleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.on).toHaveBeenCalledWith('finish', expect.any(Function));
    expect(mockNext).toHaveBeenCalled();

    // Simular evento 'finish'
    const finishCallback = (mockRes.on as jest.Mock).mock.calls[0][1];
    await finishCallback();

    expect(mockCreate).toHaveBeenCalledWith({
      userId: null,
      action: 'GET /test',
      statusCode: 200,
      duration: expect.any(Number),
      ip: '127.0.0.1',
      userAgent: 'Mozilla/5.0',
      metadata: {
        query: { page: '1' },
        params: { id: '123' },
        body: { name: 'Test' },
      },
    });
  });
}); 