import { Request, Response, NextFunction } from 'express';
import { sanitizeMiddleware } from '../../middlewares/sanitize.middleware';
import { logger } from '../../utils/logger';

jest.mock('../../utils/logger');

describe('Sanitize Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      body: {},
      query: {},
      params: {},
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

  it('should sanitize string values in body', () => {
    mockReq.body = {
      name: '<script>alert("xss")</script>',
      email: 'test@example.com',
    };

    sanitizeMiddleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockReq.body).toEqual({
      name: '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;',
      email: 'test@example.com',
    });
    expect(mockNext).toHaveBeenCalled();
  });

  it('should sanitize string values in query', () => {
    mockReq.query = {
      search: '<img src="x" onerror="alert(1)">',
      page: '1',
    };

    sanitizeMiddleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockReq.query).toEqual({
      search: '&lt;img src=&quot;x&quot; onerror=&quot;alert(1)&quot;&gt;',
      page: '1',
    });
    expect(mockNext).toHaveBeenCalled();
  });

  it('should sanitize string values in params', () => {
    mockReq.params = {
      id: '<script>alert("xss")</script>',
    };

    sanitizeMiddleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockReq.params).toEqual({
      id: '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;',
    });
    expect(mockNext).toHaveBeenCalled();
  });

  it('should handle nested objects', () => {
    mockReq.body = {
      user: {
        name: '<script>alert("xss")</script>',
        profile: {
          bio: '<img src="x" onerror="alert(1)">',
        },
      },
    };

    sanitizeMiddleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockReq.body).toEqual({
      user: {
        name: '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;',
        profile: {
          bio: '&lt;img src=&quot;x&quot; onerror=&quot;alert(1)&quot;&gt;',
        },
      },
    });
    expect(mockNext).toHaveBeenCalled();
  });

  it('should handle arrays', () => {
    mockReq.body = {
      tags: ['<script>alert("xss")</script>', 'safe', '<img src="x" onerror="alert(1)">'],
    };

    sanitizeMiddleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockReq.body).toEqual({
      tags: [
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;',
        'safe',
        '&lt;img src=&quot;x&quot; onerror=&quot;alert(1)&quot;&gt;',
      ],
    });
    expect(mockNext).toHaveBeenCalled();
  });

  it('should handle errors gracefully', () => {
    mockReq.body = {
      circular: {},
    };
    mockReq.body.circular.self = mockReq.body;

    sanitizeMiddleware(mockReq as Request, mockRes as Response, mockNext);

    expect(logger.error).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Erro ao processar dados' });
    expect(mockNext).not.toHaveBeenCalled();
  });
}); 