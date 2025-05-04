import { CacheService } from './cache.service';
import { Company } from '../models/company.model';
import { Config } from '../models/config.model';
import { logger } from '../utils/logger';

export class ConfigService {
  private static instance: ConfigService;
  private cacheService: CacheService;

  private constructor() {
    this.cacheService = CacheService.getInstance();
  }

  public static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  /**
   * Cria uma nova configuração de ponto
   */
  public async createConfig(
    companyId: string,
    data: {
      lateTolerance?: number;
      lunchTime?: number;
      requirePhoto?: boolean;
      requireLocation?: boolean;
      allowJustification?: boolean;
      allowRemote?: boolean;
      allowExtraHours?: boolean;
      allowHolidayWork?: boolean;
      allowWeekendWork?: boolean;
      allowNightWork?: boolean;
      allowMultipleEntries?: boolean;
      allowMultipleExits?: boolean;
      allowMultipleBreaks?: boolean;
      allowMultipleLunches?: boolean;
      allowMultipleNightWork?: boolean;
      allowMultipleHolidayWork?: boolean;
      allowMultipleWeekendWork?: boolean;
      allowMultipleExtraHours?: boolean;
      allowMultipleRemoteWork?: boolean;
      allowMultipleJustification?: boolean;
      allowMultiplePhoto?: boolean;
      allowMultipleLocation?: boolean;
    }
  ): Promise<Config> {
    try {
      const config = await Config.create({
        companyId,
        ...data,
      });

      // Invalida o cache
      await this.cacheService.del(`config:${companyId}`);

      return config;
    } catch (error) {
      logger.error('Erro ao criar configuração:', error);
      throw new Error('Erro ao criar configuração');
    }
  }

  /**
   * Obtém a configuração de ponto de uma empresa
   */
  public async getConfig(companyId: string): Promise<Config | null> {
    try {
      // Tenta obter do cache
      const cachedConfig = await this.cacheService.getJson<Config>(`config:${companyId}`);
      if (cachedConfig) {
        return cachedConfig;
      }

      // Se não estiver no cache, busca do banco
      const config = await Config.findOne({
        where: { companyId },
        include: [Company],
      });

      if (config) {
        // Armazena no cache por 1 hora
        await this.cacheService.setJson(`config:${companyId}`, config, 3600);
      }

      return config;
    } catch (error) {
      logger.error('Erro ao obter configuração:', error);
      throw new Error('Erro ao obter configuração');
    }
  }

  /**
   * Atualiza a configuração de ponto de uma empresa
   */
  public async updateConfig(
    companyId: string,
    data: {
      lateTolerance?: number;
      lunchTime?: number;
      requirePhoto?: boolean;
      requireLocation?: boolean;
      allowJustification?: boolean;
      allowRemote?: boolean;
      allowExtraHours?: boolean;
      allowHolidayWork?: boolean;
      allowWeekendWork?: boolean;
      allowNightWork?: boolean;
      allowMultipleEntries?: boolean;
      allowMultipleExits?: boolean;
      allowMultipleBreaks?: boolean;
      allowMultipleLunches?: boolean;
      allowMultipleNightWork?: boolean;
      allowMultipleHolidayWork?: boolean;
      allowMultipleWeekendWork?: boolean;
      allowMultipleExtraHours?: boolean;
      allowMultipleRemoteWork?: boolean;
      allowMultipleJustification?: boolean;
      allowMultiplePhoto?: boolean;
      allowMultipleLocation?: boolean;
    }
  ): Promise<Config | null> {
    try {
      const [affectedCount, affectedRows] = await Config.update(
        { ...data },
        {
          where: { companyId },
          returning: true,
        }
      );

      if (affectedCount === 0) {
        return null;
      }

      // Invalida o cache
      await this.cacheService.del(`config:${companyId}`);

      return affectedRows[0];
    } catch (error) {
      logger.error('Erro ao atualizar configuração:', error);
      throw new Error('Erro ao atualizar configuração');
    }
  }

  /**
   * Remove a configuração de ponto de uma empresa
   */
  public async deleteConfig(companyId: string): Promise<boolean> {
    try {
      const affectedCount = await Config.destroy({
        where: { companyId },
      });

      // Invalida o cache
      await this.cacheService.del(`config:${companyId}`);

      return affectedCount > 0;
    } catch (error) {
      logger.error('Erro ao remover configuração:', error);
      throw new Error('Erro ao remover configuração');
    }
  }

  /**
   * Verifica se uma configuração está ativa
   */
  public async isConfigActive(companyId: string, key: keyof Config): Promise<boolean> {
    try {
      const config = await this.getConfig(companyId);
      if (!config) {
        return false;
      }
      return config[key] as boolean;
    } catch (error) {
      logger.error('Erro ao verificar configuração:', error);
      return false;
    }
  }

  /**
   * Obtém a tolerância de atraso
   */
  public async getLateTolerance(companyId: string): Promise<number> {
    try {
      const config = await this.getConfig(companyId);
      if (!config) {
        return 0;
      }
      return config.lateTolerance;
    } catch (error) {
      logger.error('Erro ao obter tolerância de atraso:', error);
      return 0;
    }
  }

  /**
   * Obtém o tempo de almoço
   */
  public async getLunchTime(companyId: string): Promise<number> {
    try {
      const config = await this.getConfig(companyId);
      if (!config) {
        return 0;
      }
      return config.lunchTime;
    } catch (error) {
      logger.error('Erro ao obter tempo de almoço:', error);
      return 0;
    }
  }
} 