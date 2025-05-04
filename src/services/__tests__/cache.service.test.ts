import { CacheService } from '../cache.service';
import Redis from 'ioredis';

jest.mock('ioredis');

describe('CacheService', () => {
  let service: CacheService;
  let mockRedis: any;

  beforeEach(() => {
    service = CacheService.getInstance();
    mockRedis = {
      get: jest.fn(),
      set: jest.fn(),
      setex: jest.fn(),
      del: jest.fn(),
      exists: jest.fn(),
      flushall: jest.fn(),
      quit: jest.fn()
    };
    (Redis as jest.Mock).mockImplementation(() => mockRedis);
    jest.clearAllMocks();
  });

  describe('get', () => {
    it('should get value from cache successfully', async () => {
      const key = 'test-key';
      const value = 'test-value';

      mockRedis.get.mockResolvedValue(value);

      const result = await service.get(key);

      expect(mockRedis.get).toHaveBeenCalledWith(key);
      expect(result).toBe(value);
    });

    it('should return null when key not found', async () => {
      const key = 'test-key';

      mockRedis.get.mockResolvedValue(null);

      const result = await service.get(key);

      expect(mockRedis.get).toHaveBeenCalledWith(key);
      expect(result).toBeNull();
    });

    it('should handle errors gracefully', async () => {
      const key = 'test-key';

      mockRedis.get.mockRejectedValue(new Error('Redis Error'));

      const result = await service.get(key);

      expect(mockRedis.get).toHaveBeenCalledWith(key);
      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    it('should set value in cache successfully', async () => {
      const key = 'test-key';
      const value = 'test-value';
      const ttl = 3600;

      await service.set(key, value, ttl);

      expect(mockRedis.setex).toHaveBeenCalledWith(key, ttl, value);
    });

    it('should set value without TTL', async () => {
      const key = 'test-key';
      const value = 'test-value';

      await service.set(key, value);

      expect(mockRedis.set).toHaveBeenCalledWith(key, value);
    });

    it('should handle errors gracefully', async () => {
      const key = 'test-key';
      const value = 'test-value';

      mockRedis.set.mockRejectedValue(new Error('Redis Error'));

      await service.set(key, value);

      expect(mockRedis.set).toHaveBeenCalledWith(key, value);
    });
  });

  describe('del', () => {
    it('should delete value from cache successfully', async () => {
      const key = 'test-key';

      await service.del(key);

      expect(mockRedis.del).toHaveBeenCalledWith(key);
    });

    it('should handle errors gracefully', async () => {
      const key = 'test-key';

      mockRedis.del.mockRejectedValue(new Error('Redis Error'));

      await service.del(key);

      expect(mockRedis.del).toHaveBeenCalledWith(key);
    });
  });

  describe('exists', () => {
    it('should check if key exists successfully', async () => {
      const key = 'test-key';

      mockRedis.exists.mockResolvedValue(1);

      const result = await service.exists(key);

      expect(mockRedis.exists).toHaveBeenCalledWith(key);
      expect(result).toBe(true);
    });

    it('should return false when key does not exist', async () => {
      const key = 'test-key';

      mockRedis.exists.mockResolvedValue(0);

      const result = await service.exists(key);

      expect(mockRedis.exists).toHaveBeenCalledWith(key);
      expect(result).toBe(false);
    });

    it('should handle errors gracefully', async () => {
      const key = 'test-key';

      mockRedis.exists.mockRejectedValue(new Error('Redis Error'));

      const result = await service.exists(key);

      expect(mockRedis.exists).toHaveBeenCalledWith(key);
      expect(result).toBe(false);
    });
  });

  describe('getJson', () => {
    it('should get and parse JSON value successfully', async () => {
      const key = 'test-key';
      const value = { test: 'value' };

      mockRedis.get.mockResolvedValue(JSON.stringify(value));

      const result = await service.getJson(key);

      expect(mockRedis.get).toHaveBeenCalledWith(key);
      expect(result).toEqual(value);
    });

    it('should return null for invalid JSON', async () => {
      const key = 'test-key';

      mockRedis.get.mockResolvedValue('invalid-json');

      const result = await service.getJson(key);

      expect(mockRedis.get).toHaveBeenCalledWith(key);
      expect(result).toBeNull();
    });
  });

  describe('setJson', () => {
    it('should stringify and set JSON value successfully', async () => {
      const key = 'test-key';
      const value = { test: 'value' };
      const ttl = 3600;

      await service.setJson(key, value, ttl);

      expect(mockRedis.setex).toHaveBeenCalledWith(
        key,
        ttl,
        JSON.stringify(value)
      );
    });

    it('should set JSON value without TTL', async () => {
      const key = 'test-key';
      const value = { test: 'value' };

      await service.setJson(key, value);

      expect(mockRedis.set).toHaveBeenCalledWith(
        key,
        JSON.stringify(value)
      );
    });
  });

  describe('flushAll', () => {
    it('should flush all cache successfully', async () => {
      await service.flushAll();

      expect(mockRedis.flushall).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      mockRedis.flushall.mockRejectedValue(new Error('Redis Error'));

      await service.flushAll();

      expect(mockRedis.flushall).toHaveBeenCalled();
    });
  });

  describe('close', () => {
    it('should close Redis connection successfully', async () => {
      await service.close();

      expect(mockRedis.quit).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      mockRedis.quit.mockRejectedValue(new Error('Redis Error'));

      await service.close();

      expect(mockRedis.quit).toHaveBeenCalled();
    });
  });
}); 