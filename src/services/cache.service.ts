import Redis from 'ioredis';
import { envConfig } from '../config/env';
import { logger } from '../utils/logger';

export class CacheService {
  private static instance: CacheService;
  private redis: Redis;

  private constructor() {
    this.redis = new Redis({
      host: envConfig.redis.host,
      port: envConfig.redis.port,
    });

    this.redis.on('error', (error) => {
      logger.error('Erro na conexão com Redis:', error);
    });
  }

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  /**
   * Obtém um valor do cache
   */
  public async get(key: string): Promise<string | null> {
    try {
      return await this.redis.get(key);
    } catch (error) {
      logger.error('Erro ao obter valor do cache:', error);
      return null;
    }
  }

  /**
   * Define um valor no cache
   */
  public async set(
    key: string,
    value: string,
    ttl?: number
  ): Promise<void> {
    try {
      if (ttl) {
        await this.redis.setex(key, ttl, value);
      } else {
        await this.redis.set(key, value);
      }
    } catch (error) {
      logger.error('Erro ao definir valor no cache:', error);
    }
  }

  /**
   * Remove um valor do cache
   */
  public async del(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      logger.error('Erro ao remover valor do cache:', error);
    }
  }

  /**
   * Verifica se uma chave existe no cache
   */
  public async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Erro ao verificar existência de chave no cache:', error);
      return false;
    }
  }

  /**
   * Obtém um valor do cache e converte para JSON
   */
  public async getJson<T>(key: string): Promise<T | null> {
    try {
      const value = await this.get(key);
      if (!value) {
        return null;
      }
      return JSON.parse(value) as T;
    } catch (error) {
      logger.error('Erro ao obter valor JSON do cache:', error);
      return null;
    }
  }

  /**
   * Define um valor JSON no cache
   */
  public async setJson<T>(
    key: string,
    value: T,
    ttl?: number
  ): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await this.set(key, jsonValue, ttl);
    } catch (error) {
      logger.error('Erro ao definir valor JSON no cache:', error);
    }
  }

  /**
   * Limpa todo o cache
   */
  public async flushAll(): Promise<void> {
    try {
      await this.redis.flushall();
    } catch (error) {
      logger.error('Erro ao limpar cache:', error);
    }
  }

  /**
   * Fecha a conexão com o Redis
   */
  public async close(): Promise<void> {
    try {
      await this.redis.quit();
    } catch (error) {
      logger.error('Erro ao fechar conexão com Redis:', error);
    }
  }
} 