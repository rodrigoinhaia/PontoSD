import { CacheService } from '../../services/cache.service';
import { Config } from '../../models/config.model';
import { ConfigService } from '../../services/config.service';

jest.mock('../../models/config.model');
jest.mock('../../services/cache.service');

describe('ConfigService', () => {
  let configService: ConfigService;
  let cacheService: CacheService;

  const mockConfig = {
    id: '1',
    companyId: 'company-1',
    lateTolerance: 15,
    lunchTime: 60,
    requirePhoto: true,
    requireLocation: true,
    allowJustification: true,
    allowRemote: true,
    allowExtraHours: true,
    allowHolidayWork: true,
    allowWeekendWork: true,
    allowNightWork: true,
    allowMultipleEntries: true,
    allowMultipleExits: true,
    allowMultipleBreaks: true,
    allowMultipleLunches: true,
    allowMultipleNightWork: true,
    allowMultipleHolidayWork: true,
    allowMultipleWeekendWork: true,
    allowMultipleExtraHours: true,
    allowMultipleRemoteWork: true,
    allowMultipleJustification: true,
    allowMultiplePhoto: true,
    allowMultipleLocation: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    configService = ConfigService.getInstance();
    cacheService = CacheService.getInstance();
  });

  describe('createConfig', () => {
    it('should create a new config', async () => {
      const createData = {
        lateTolerance: 15,
        lunchTime: 60,
        requirePhoto: true,
      };

      (Config.create as jest.Mock).mockResolvedValue(mockConfig);
      (cacheService.del as jest.Mock).mockResolvedValue(true);

      const result = await configService.createConfig('company-1', createData);

      expect(Config.create).toHaveBeenCalledWith({
        companyId: 'company-1',
        ...createData,
      });
      expect(cacheService.del).toHaveBeenCalledWith('config:company-1');
      expect(result).toEqual(mockConfig);
    });

    it('should throw error when creation fails', async () => {
      const createData = {
        lateTolerance: 15,
      };

      (Config.create as jest.Mock).mockRejectedValue(new Error('Creation failed'));

      await expect(configService.createConfig('company-1', createData)).rejects.toThrow(
        'Erro ao criar configuração'
      );
    });
  });

  describe('getConfig', () => {
    it('should return config from cache', async () => {
      (cacheService.getJson as jest.Mock).mockResolvedValue(mockConfig);

      const result = await configService.getConfig('company-1');

      expect(cacheService.getJson).toHaveBeenCalledWith('config:company-1');
      expect(Config.findOne).not.toHaveBeenCalled();
      expect(result).toEqual(mockConfig);
    });

    it('should fetch from database and cache when not in cache', async () => {
      (cacheService.getJson as jest.Mock).mockResolvedValue(null);
      (Config.findOne as jest.Mock).mockResolvedValue(mockConfig);
      (cacheService.setJson as jest.Mock).mockResolvedValue(true);

      const result = await configService.getConfig('company-1');

      expect(cacheService.getJson).toHaveBeenCalledWith('config:company-1');
      expect(Config.findOne).toHaveBeenCalledWith({
        where: { companyId: 'company-1' },
        include: expect.any(Array),
      });
      expect(cacheService.setJson).toHaveBeenCalledWith('config:company-1', mockConfig, 3600);
      expect(result).toEqual(mockConfig);
    });

    it('should throw error when fetch fails', async () => {
      (cacheService.getJson as jest.Mock).mockResolvedValue(null);
      (Config.findOne as jest.Mock).mockRejectedValue(new Error('Fetch failed'));

      await expect(configService.getConfig('company-1')).rejects.toThrow(
        'Erro ao obter configuração'
      );
    });
  });

  describe('updateConfig', () => {
    it('should update config successfully', async () => {
      const updateData = {
        lateTolerance: 30,
        lunchTime: 90,
      };

      (Config.update as jest.Mock).mockResolvedValue([1, [mockConfig]]);
      (cacheService.del as jest.Mock).mockResolvedValue(true);

      const result = await configService.updateConfig('company-1', updateData);

      expect(Config.update).toHaveBeenCalledWith(updateData, {
        where: { companyId: 'company-1' },
        returning: true,
      });
      expect(cacheService.del).toHaveBeenCalledWith('config:company-1');
      expect(result).toEqual(mockConfig);
    });

    it('should return null when no config is updated', async () => {
      const updateData = {
        lateTolerance: 30,
      };

      (Config.update as jest.Mock).mockResolvedValue([0, []]);

      const result = await configService.updateConfig('company-1', updateData);

      expect(result).toBeNull();
    });

    it('should throw error when update fails', async () => {
      const updateData = {
        lateTolerance: 30,
      };

      (Config.update as jest.Mock).mockRejectedValue(new Error('Update failed'));

      await expect(configService.updateConfig('company-1', updateData)).rejects.toThrow(
        'Erro ao atualizar configuração'
      );
    });
  });

  describe('deleteConfig', () => {
    it('should delete config successfully', async () => {
      (Config.destroy as jest.Mock).mockResolvedValue(1);
      (cacheService.del as jest.Mock).mockResolvedValue(true);

      const result = await configService.deleteConfig('company-1');

      expect(Config.destroy).toHaveBeenCalledWith({
        where: { companyId: 'company-1' },
      });
      expect(cacheService.del).toHaveBeenCalledWith('config:company-1');
      expect(result).toBe(true);
    });

    it('should return false when no config is deleted', async () => {
      (Config.destroy as jest.Mock).mockResolvedValue(0);

      const result = await configService.deleteConfig('company-1');

      expect(result).toBe(false);
    });

    it('should throw error when deletion fails', async () => {
      (Config.destroy as jest.Mock).mockRejectedValue(new Error('Deletion failed'));

      await expect(configService.deleteConfig('company-1')).rejects.toThrow(
        'Erro ao remover configuração'
      );
    });
  });

  describe('isConfigActive', () => {
    it('should return true when config is active', async () => {
      (cacheService.getJson as jest.Mock).mockResolvedValue(mockConfig);

      const result = await configService.isConfigActive(
        'company-1',
        'requirePhoto' as keyof Config
      );

      expect(result).toBe(true);
    });

    it('should return false when config is not found', async () => {
      (cacheService.getJson as jest.Mock).mockResolvedValue(null);

      const result = await configService.isConfigActive(
        'company-1',
        'requirePhoto' as keyof Config
      );

      expect(result).toBe(false);
    });

    it('should return false when error occurs', async () => {
      (cacheService.getJson as jest.Mock).mockRejectedValue(new Error('Error'));

      const result = await configService.isConfigActive(
        'company-1',
        'requirePhoto' as keyof Config
      );

      expect(result).toBe(false);
    });
  });

  describe('getLateTolerance', () => {
    it('should return late tolerance value', async () => {
      (cacheService.getJson as jest.Mock).mockResolvedValue(mockConfig);

      const result = await configService.getLateTolerance('company-1');

      expect(result).toBe(15);
    });

    it('should return 0 when config is not found', async () => {
      (cacheService.getJson as jest.Mock).mockResolvedValue(null);

      const result = await configService.getLateTolerance('company-1');

      expect(result).toBe(0);
    });

    it('should return 0 when error occurs', async () => {
      (cacheService.getJson as jest.Mock).mockRejectedValue(new Error('Error'));

      const result = await configService.getLateTolerance('company-1');

      expect(result).toBe(0);
    });
  });

  describe('getLunchTime', () => {
    it('should return lunch time value', async () => {
      (cacheService.getJson as jest.Mock).mockResolvedValue(mockConfig);

      const result = await configService.getLunchTime('company-1');

      expect(result).toBe(60);
    });

    it('should return 0 when config is not found', async () => {
      (cacheService.getJson as jest.Mock).mockResolvedValue(null);

      const result = await configService.getLunchTime('company-1');

      expect(result).toBe(0);
    });

    it('should return 0 when error occurs', async () => {
      (cacheService.getJson as jest.Mock).mockRejectedValue(new Error('Error'));

      const result = await configService.getLunchTime('company-1');

      expect(result).toBe(0);
    });
  });
}); 