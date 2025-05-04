import { Configuration } from '../../models/configuration.model';
import { ConfigurationService } from '../../services/configuration.service';
import { CacheService } from '../../services/cache.service';

jest.mock('../../models/configuration.model');
jest.mock('../../services/cache.service');

describe('ConfigurationService', () => {
  let configService: ConfigurationService;
  let cacheService: CacheService;

  const mockConfig = {
    id: '1',
    companyId: 'company-1',
    key: 'test-key',
    value: 'test-value',
    type: 'STRING' as const,
    description: 'Test configuration',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    configService = ConfigurationService.getInstance();
    cacheService = CacheService.getInstance();
  });

  describe('createConfiguration', () => {
    it('should create a new configuration', async () => {
      (Configuration.create as jest.Mock).mockResolvedValue(mockConfig);
      (cacheService.del as jest.Mock).mockResolvedValue(true);

      const result = await configService.createConfiguration(
        'company-1',
        'test-key',
        'test-value',
        'STRING',
        'Test configuration'
      );

      expect(Configuration.create).toHaveBeenCalledWith({
        companyId: 'company-1',
        key: 'test-key',
        value: 'test-value',
        type: 'STRING',
        description: 'Test configuration',
      });
      expect(cacheService.del).toHaveBeenCalledWith('configurations:company-1');
      expect(result).toEqual(mockConfig);
    });

    it('should throw error when creation fails', async () => {
      (Configuration.create as jest.Mock).mockRejectedValue(new Error('Creation failed'));

      await expect(
        configService.createConfiguration(
          'company-1',
          'test-key',
          'test-value',
          'STRING',
          'Test configuration'
        )
      ).rejects.toThrow('Erro ao criar configuração');
    });
  });

  describe('getConfigurations', () => {
    it('should return configurations from cache', async () => {
      (cacheService.getJson as jest.Mock).mockResolvedValue([mockConfig]);

      const result = await configService.getConfigurations('company-1');

      expect(cacheService.getJson).toHaveBeenCalledWith('configurations:company-1');
      expect(Configuration.findAll).not.toHaveBeenCalled();
      expect(result).toEqual([mockConfig]);
    });

    it('should fetch from database and cache when not in cache', async () => {
      (cacheService.getJson as jest.Mock).mockResolvedValue(null);
      (Configuration.findAll as jest.Mock).mockResolvedValue([mockConfig]);
      (cacheService.setJson as jest.Mock).mockResolvedValue(true);

      const result = await configService.getConfigurations('company-1');

      expect(cacheService.getJson).toHaveBeenCalledWith('configurations:company-1');
      expect(Configuration.findAll).toHaveBeenCalledWith({
        where: { companyId: 'company-1' },
        include: expect.any(Array),
      });
      expect(cacheService.setJson).toHaveBeenCalledWith(
        'configurations:company-1',
        [mockConfig],
        3600
      );
      expect(result).toEqual([mockConfig]);
    });

    it('should throw error when fetch fails', async () => {
      (cacheService.getJson as jest.Mock).mockResolvedValue(null);
      (Configuration.findAll as jest.Mock).mockRejectedValue(new Error('Fetch failed'));

      await expect(configService.getConfigurations('company-1')).rejects.toThrow(
        'Erro ao obter configurações'
      );
    });
  });

  describe('getConfiguration', () => {
    it('should return configuration from cache', async () => {
      (cacheService.getJson as jest.Mock).mockResolvedValue(mockConfig);

      const result = await configService.getConfiguration('company-1', 'test-key');

      expect(cacheService.getJson).toHaveBeenCalledWith('configuration:company-1:test-key');
      expect(Configuration.findOne).not.toHaveBeenCalled();
      expect(result).toEqual(mockConfig);
    });

    it('should fetch from database and cache when not in cache', async () => {
      (cacheService.getJson as jest.Mock).mockResolvedValue(null);
      (Configuration.findOne as jest.Mock).mockResolvedValue(mockConfig);
      (cacheService.setJson as jest.Mock).mockResolvedValue(true);

      const result = await configService.getConfiguration('company-1', 'test-key');

      expect(cacheService.getJson).toHaveBeenCalledWith('configuration:company-1:test-key');
      expect(Configuration.findOne).toHaveBeenCalledWith({
        where: { companyId: 'company-1', key: 'test-key' },
        include: expect.any(Array),
      });
      expect(cacheService.setJson).toHaveBeenCalledWith(
        'configuration:company-1:test-key',
        mockConfig,
        3600
      );
      expect(result).toEqual(mockConfig);
    });

    it('should throw error when fetch fails', async () => {
      (cacheService.getJson as jest.Mock).mockResolvedValue(null);
      (Configuration.findOne as jest.Mock).mockRejectedValue(new Error('Fetch failed'));

      await expect(configService.getConfiguration('company-1', 'test-key')).rejects.toThrow(
        'Erro ao obter configuração'
      );
    });
  });

  describe('updateConfiguration', () => {
    it('should update configuration successfully', async () => {
      (Configuration.update as jest.Mock).mockResolvedValue([1, [mockConfig]]);
      (cacheService.del as jest.Mock).mockResolvedValue(true);

      const result = await configService.updateConfiguration('company-1', 'test-key', 'new-value');

      expect(Configuration.update).toHaveBeenCalledWith(
        { value: 'new-value' },
        {
          where: { companyId: 'company-1', key: 'test-key' },
          returning: true,
        }
      );
      expect(cacheService.del).toHaveBeenCalledWith('configuration:company-1:test-key');
      expect(cacheService.del).toHaveBeenCalledWith('configurations:company-1');
      expect(result).toEqual(mockConfig);
    });

    it('should return null when no configuration is updated', async () => {
      (Configuration.update as jest.Mock).mockResolvedValue([0, []]);

      const result = await configService.updateConfiguration('company-1', 'test-key', 'new-value');

      expect(result).toBeNull();
    });

    it('should throw error when update fails', async () => {
      (Configuration.update as jest.Mock).mockRejectedValue(new Error('Update failed'));

      await expect(
        configService.updateConfiguration('company-1', 'test-key', 'new-value')
      ).rejects.toThrow('Erro ao atualizar configuração');
    });
  });

  describe('deleteConfiguration', () => {
    it('should delete configuration successfully', async () => {
      (Configuration.destroy as jest.Mock).mockResolvedValue(1);
      (cacheService.del as jest.Mock).mockResolvedValue(true);

      const result = await configService.deleteConfiguration('company-1', 'test-key');

      expect(Configuration.destroy).toHaveBeenCalledWith({
        where: { companyId: 'company-1', key: 'test-key' },
      });
      expect(cacheService.del).toHaveBeenCalledWith('configuration:company-1:test-key');
      expect(cacheService.del).toHaveBeenCalledWith('configurations:company-1');
      expect(result).toBe(true);
    });

    it('should return false when no configuration is deleted', async () => {
      (Configuration.destroy as jest.Mock).mockResolvedValue(0);

      const result = await configService.deleteConfiguration('company-1', 'test-key');

      expect(result).toBe(false);
    });

    it('should throw error when deletion fails', async () => {
      (Configuration.destroy as jest.Mock).mockRejectedValue(new Error('Deletion failed'));

      await expect(configService.deleteConfiguration('company-1', 'test-key')).rejects.toThrow(
        'Erro ao remover configuração'
      );
    });
  });

  describe('getStringValue', () => {
    it('should return string value', async () => {
      (cacheService.getJson as jest.Mock).mockResolvedValue(mockConfig);

      const result = await configService.getStringValue('company-1', 'test-key');

      expect(result).toBe('test-value');
    });

    it('should return null when configuration is not found', async () => {
      (cacheService.getJson as jest.Mock).mockResolvedValue(null);

      const result = await configService.getStringValue('company-1', 'test-key');

      expect(result).toBeNull();
    });

    it('should return null when type is not STRING', async () => {
      (cacheService.getJson as jest.Mock).mockResolvedValue({
        ...mockConfig,
        type: 'NUMBER',
      });

      const result = await configService.getStringValue('company-1', 'test-key');

      expect(result).toBeNull();
    });

    it('should return null when error occurs', async () => {
      (cacheService.getJson as jest.Mock).mockRejectedValue(new Error('Error'));

      const result = await configService.getStringValue('company-1', 'test-key');

      expect(result).toBeNull();
    });
  });

  describe('getNumberValue', () => {
    it('should return number value', async () => {
      (cacheService.getJson as jest.Mock).mockResolvedValue({
        ...mockConfig,
        type: 'NUMBER',
        value: '42',
      });

      const result = await configService.getNumberValue('company-1', 'test-key');

      expect(result).toBe(42);
    });

    it('should return null when configuration is not found', async () => {
      (cacheService.getJson as jest.Mock).mockResolvedValue(null);

      const result = await configService.getNumberValue('company-1', 'test-key');

      expect(result).toBeNull();
    });

    it('should return null when type is not NUMBER', async () => {
      (cacheService.getJson as jest.Mock).mockResolvedValue(mockConfig);

      const result = await configService.getNumberValue('company-1', 'test-key');

      expect(result).toBeNull();
    });

    it('should return null when error occurs', async () => {
      (cacheService.getJson as jest.Mock).mockRejectedValue(new Error('Error'));

      const result = await configService.getNumberValue('company-1', 'test-key');

      expect(result).toBeNull();
    });
  });

  describe('getBooleanValue', () => {
    it('should return boolean value', async () => {
      (cacheService.getJson as jest.Mock).mockResolvedValue({
        ...mockConfig,
        type: 'BOOLEAN',
        value: 'true',
      });

      const result = await configService.getBooleanValue('company-1', 'test-key');

      expect(result).toBe(true);
    });

    it('should return null when configuration is not found', async () => {
      (cacheService.getJson as jest.Mock).mockResolvedValue(null);

      const result = await configService.getBooleanValue('company-1', 'test-key');

      expect(result).toBeNull();
    });

    it('should return null when type is not BOOLEAN', async () => {
      (cacheService.getJson as jest.Mock).mockResolvedValue(mockConfig);

      const result = await configService.getBooleanValue('company-1', 'test-key');

      expect(result).toBeNull();
    });

    it('should return null when error occurs', async () => {
      (cacheService.getJson as jest.Mock).mockRejectedValue(new Error('Error'));

      const result = await configService.getBooleanValue('company-1', 'test-key');

      expect(result).toBeNull();
    });
  });

  describe('getJsonValue', () => {
    it('should return JSON value', async () => {
      const jsonData = { test: 'value' };
      (cacheService.getJson as jest.Mock).mockResolvedValue({
        ...mockConfig,
        type: 'JSON',
        value: JSON.stringify(jsonData),
      });

      const result = await configService.getJsonValue<typeof jsonData>('company-1', 'test-key');

      expect(result).toEqual(jsonData);
    });

    it('should return null when configuration is not found', async () => {
      (cacheService.getJson as jest.Mock).mockResolvedValue(null);

      const result = await configService.getJsonValue('company-1', 'test-key');

      expect(result).toBeNull();
    });

    it('should return null when type is not JSON', async () => {
      (cacheService.getJson as jest.Mock).mockResolvedValue(mockConfig);

      const result = await configService.getJsonValue('company-1', 'test-key');

      expect(result).toBeNull();
    });

    it('should return null when error occurs', async () => {
      (cacheService.getJson as jest.Mock).mockRejectedValue(new Error('Error'));

      const result = await configService.getJsonValue('company-1', 'test-key');

      expect(result).toBeNull();
    });
  });
}); 