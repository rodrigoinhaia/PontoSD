import { CacheService } from './cache.service';
import { Company } from '../models/company.model';
import { Configuration } from '../models/configuration.model';
import { logger } from '../utils/logger';

export class ConfigurationService {
  private static instance: ConfigurationService;
  private cacheService: CacheService;

  private constructor() {
    this.cacheService = CacheService.getInstance();
  }

  public static getInstance(): ConfigurationService {
    if (!ConfigurationService.instance) {
      ConfigurationService.instance = new ConfigurationService();
    }
    return ConfigurationService.instance;
  }

  /**
   * Cria uma nova configuração
   */
  public async createConfiguration(
    companyId: string,
    key: string,
    value: string,
    type: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON',
    description: string
  ): Promise<Configuration> {
    try {
      const configuration = await Configuration.create({
        companyId,
        key,
        value,
        type,
        description,
      });

      // Invalida o cache
      await this.cacheService.del(`configurations:${companyId}`);

      return configuration;
    } catch (error) {
      logger.error('Erro ao criar configuração:', error);
      throw new Error('Erro ao criar configuração');
    }
  }

  /**
   * Obtém todas as configurações de uma empresa
   */
  public async getConfigurations(companyId: string): Promise<Configuration[]> {
    try {
      // Tenta obter do cache
      const cachedConfigs = await this.cacheService.getJson<Configuration[]>(
        `configurations:${companyId}`
      );
      if (cachedConfigs) {
        return cachedConfigs;
      }

      // Se não estiver no cache, busca do banco
      const configurations = await Configuration.findAll({
        where: { companyId },
        include: [Company],
      });

      // Armazena no cache por 1 hora
      await this.cacheService.setJson(`configurations:${companyId}`, configurations, 3600);

      return configurations;
    } catch (error) {
      logger.error('Erro ao obter configurações:', error);
      throw new Error('Erro ao obter configurações');
    }
  }

  /**
   * Obtém uma configuração específica
   */
  public async getConfiguration(companyId: string, key: string): Promise<Configuration | null> {
    try {
      // Tenta obter do cache
      const cachedConfig = await this.cacheService.getJson<Configuration>(
        `configuration:${companyId}:${key}`
      );
      if (cachedConfig) {
        return cachedConfig;
      }

      // Se não estiver no cache, busca do banco
      const configuration = await Configuration.findOne({
        where: { companyId, key },
        include: [Company],
      });

      if (configuration) {
        // Armazena no cache por 1 hora
        await this.cacheService.setJson(`configuration:${companyId}:${key}`, configuration, 3600);
      }

      return configuration;
    } catch (error) {
      logger.error('Erro ao obter configuração:', error);
      throw new Error('Erro ao obter configuração');
    }
  }

  /**
   * Atualiza uma configuração
   */
  public async updateConfiguration(
    companyId: string,
    key: string,
    value: string
  ): Promise<Configuration | null> {
    try {
      const [affectedCount, affectedRows] = await Configuration.update(
        { value },
        {
          where: { companyId, key },
          returning: true,
        }
      );

      if (affectedCount === 0) {
        return null;
      }

      // Invalida o cache
      await this.cacheService.del(`configuration:${companyId}:${key}`);
      await this.cacheService.del(`configurations:${companyId}`);

      return affectedRows[0];
    } catch (error) {
      logger.error('Erro ao atualizar configuração:', error);
      throw new Error('Erro ao atualizar configuração');
    }
  }

  /**
   * Remove uma configuração
   */
  public async deleteConfiguration(companyId: string, key: string): Promise<boolean> {
    try {
      const affectedCount = await Configuration.destroy({
        where: { companyId, key },
      });

      // Invalida o cache
      await this.cacheService.del(`configuration:${companyId}:${key}`);
      await this.cacheService.del(`configurations:${companyId}`);

      return affectedCount > 0;
    } catch (error) {
      logger.error('Erro ao remover configuração:', error);
      throw new Error('Erro ao remover configuração');
    }
  }

  /**
   * Obtém o valor de uma configuração como string
   */
  public async getStringValue(companyId: string, key: string): Promise<string | null> {
    try {
      const config = await this.getConfiguration(companyId, key);
      if (!config || config.type !== 'STRING') {
        return null;
      }
      return config.value;
    } catch (error) {
      logger.error('Erro ao obter valor string:', error);
      return null;
    }
  }

  /**
   * Obtém o valor de uma configuração como número
   */
  public async getNumberValue(companyId: string, key: string): Promise<number | null> {
    try {
      const config = await this.getConfiguration(companyId, key);
      if (!config || config.type !== 'NUMBER') {
        return null;
      }
      return Number(config.value);
    } catch (error) {
      logger.error('Erro ao obter valor numérico:', error);
      return null;
    }
  }

  /**
   * Obtém o valor de uma configuração como booleano
   */
  public async getBooleanValue(companyId: string, key: string): Promise<boolean | null> {
    try {
      const config = await this.getConfiguration(companyId, key);
      if (!config || config.type !== 'BOOLEAN') {
        return null;
      }
      return config.value.toLowerCase() === 'true';
    } catch (error) {
      logger.error('Erro ao obter valor booleano:', error);
      return null;
    }
  }

  /**
   * Obtém o valor de uma configuração como JSON
   */
  public async getJsonValue<T>(companyId: string, key: string): Promise<T | null> {
    try {
      const config = await this.getConfiguration(companyId, key);
      if (!config || config.type !== 'JSON') {
        return null;
      }
      return JSON.parse(config.value) as T;
    } catch (error) {
      logger.error('Erro ao obter valor JSON:', error);
      return null;
    }
  }
} 