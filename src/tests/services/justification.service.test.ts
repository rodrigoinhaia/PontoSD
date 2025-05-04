import { CacheService } from '../../services/cache.service';
import { Justification } from '../../models/justification.model';
import { JustificationService } from '../../services/justification.service';

jest.mock('../../models/justification.model');
jest.mock('../../services/cache.service');

describe('JustificationService', () => {
  let justificationService: JustificationService;
  let mockJustification: jest.Mocked<typeof Justification>;
  let mockCacheService: jest.Mocked<CacheService>;

  const mockJustificationData = {
    id: 1,
    pointId: 1,
    userId: 1,
    reason: 'Test justification',
    status: 'PENDING' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    justificationService = JustificationService.getInstance();
    mockJustification = Justification as jest.Mocked<typeof Justification>;
    mockCacheService = CacheService.getInstance() as jest.Mocked<CacheService>;
  });

  describe('createJustification', () => {
    it('should create a new justification', async () => {
      const justificationData = {
        pointId: 1,
        userId: 1,
        reason: 'Test justification',
        status: 'PENDING' as const,
      };

      (mockJustification.create as jest.Mock).mockResolvedValue(mockJustificationData);

      const result = await justificationService.createJustification(
        justificationData.pointId,
        justificationData.userId,
        justificationData.reason
      );

      expect(result).toEqual(mockJustificationData);
      expect(mockJustification.create).toHaveBeenCalledWith(justificationData);
      expect(mockCacheService.del).toHaveBeenCalledWith('point:1');
      expect(mockCacheService.del).toHaveBeenCalledWith('justifications:point:1');
      expect(mockCacheService.del).toHaveBeenCalledWith('justifications:user:1');
    });

    it('should throw error when creation fails', async () => {
      const justificationData = {
        pointId: 1,
        userId: 1,
        reason: 'Test justification',
        status: 'PENDING' as const,
      };

      (mockJustification.create as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(
        justificationService.createJustification(
          justificationData.pointId,
          justificationData.userId,
          justificationData.reason
        )
      ).rejects.toThrow('Erro ao criar justificativa');
    });
  });

  describe('getJustificationById', () => {
    it('should return justification from cache', async () => {
      mockCacheService.getJson.mockResolvedValue(mockJustificationData);

      const result = await justificationService.getJustificationById(1);

      expect(result).toEqual(mockJustificationData);
      expect(mockCacheService.getJson).toHaveBeenCalledWith('justification:1');
      expect(mockJustification.findByPk).not.toHaveBeenCalled();
    });

    it('should fetch justification from database and cache it', async () => {
      mockCacheService.getJson.mockResolvedValue(null);
      (mockJustification.findByPk as jest.Mock).mockResolvedValue(mockJustificationData);

      const result = await justificationService.getJustificationById(1);

      expect(result).toEqual(mockJustificationData);
      expect(mockJustification.findByPk).toHaveBeenCalledWith(1);
      expect(mockCacheService.setJson).toHaveBeenCalledWith(
        'justification:1',
        mockJustificationData,
        3600
      );
    });

    it('should throw error when fetch fails', async () => {
      mockCacheService.getJson.mockResolvedValue(null);
      (mockJustification.findByPk as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(justificationService.getJustificationById(1)).rejects.toThrow(
        'Erro ao buscar justificativa'
      );
    });
  });

  describe('getJustificationsByPoint', () => {
    it('should return justifications from cache', async () => {
      const justifications = [mockJustificationData];
      mockCacheService.getJson.mockResolvedValue(justifications);

      const result = await justificationService.getJustificationsByPoint(1);

      expect(result).toEqual(justifications);
      expect(mockCacheService.getJson).toHaveBeenCalledWith('justifications:point:1');
      expect(mockJustification.findAll).not.toHaveBeenCalled();
    });

    it('should fetch justifications from database and cache them', async () => {
      const justifications = [mockJustificationData];
      mockCacheService.getJson.mockResolvedValue(null);
      (mockJustification.findAll as jest.Mock).mockResolvedValue(justifications);

      const result = await justificationService.getJustificationsByPoint(1);

      expect(result).toEqual(justifications);
      expect(mockJustification.findAll).toHaveBeenCalledWith({
        where: { pointId: 1 },
        order: [['createdAt', 'DESC']],
      });
      expect(mockCacheService.setJson).toHaveBeenCalledWith(
        'justifications:point:1',
        justifications,
        3600
      );
    });

    it('should throw error when fetch fails', async () => {
      mockCacheService.getJson.mockResolvedValue(null);
      (mockJustification.findAll as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(justificationService.getJustificationsByPoint(1)).rejects.toThrow(
        'Erro ao buscar justificativas do ponto'
      );
    });
  });

  describe('getJustificationsByUser', () => {
    it('should return justifications from cache', async () => {
      const justifications = [mockJustificationData];
      mockCacheService.getJson.mockResolvedValue(justifications);

      const result = await justificationService.getJustificationsByUser(1);

      expect(result).toEqual(justifications);
      expect(mockCacheService.getJson).toHaveBeenCalledWith('justifications:user:1');
      expect(mockJustification.findAll).not.toHaveBeenCalled();
    });

    it('should fetch justifications from database and cache them', async () => {
      const justifications = [mockJustificationData];
      mockCacheService.getJson.mockResolvedValue(null);
      (mockJustification.findAll as jest.Mock).mockResolvedValue(justifications);

      const result = await justificationService.getJustificationsByUser(1);

      expect(result).toEqual(justifications);
      expect(mockJustification.findAll).toHaveBeenCalledWith({
        where: { userId: 1 },
        order: [['createdAt', 'DESC']],
      });
      expect(mockCacheService.setJson).toHaveBeenCalledWith(
        'justifications:user:1',
        justifications,
        3600
      );
    });

    it('should throw error when fetch fails', async () => {
      mockCacheService.getJson.mockResolvedValue(null);
      (mockJustification.findAll as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(justificationService.getJustificationsByUser(1)).rejects.toThrow(
        'Erro ao buscar justificativas do usuário'
      );
    });
  });

  describe('updateJustificationStatus', () => {
    it('should update justification status', async () => {
      const justification = {
        ...mockJustificationData,
        update: jest.fn().mockResolvedValue({ ...mockJustificationData, status: 'APPROVED' }),
      };

      (mockJustification.findByPk as jest.Mock).mockResolvedValue(justification);

      const result = await justificationService.updateJustificationStatus(1, 'APPROVED', 1);

      expect(result).toEqual({ ...mockJustificationData, status: 'APPROVED' });
      expect(justification.update).toHaveBeenCalledWith({ status: 'APPROVED' });
      expect(mockCacheService.del).toHaveBeenCalledWith('justification:1');
      expect(mockCacheService.del).toHaveBeenCalledWith('justifications:point:1');
      expect(mockCacheService.del).toHaveBeenCalledWith('justifications:user:1');
    });

    it('should return null when justification not found', async () => {
      (mockJustification.findByPk as jest.Mock).mockResolvedValue(null);

      const result = await justificationService.updateJustificationStatus(1, 'APPROVED', 1);

      expect(result).toBeNull();
    });

    it('should throw error when update fails', async () => {
      const justification = {
        ...mockJustificationData,
        update: jest.fn().mockRejectedValue(new Error('Database error')),
      };

      (mockJustification.findByPk as jest.Mock).mockResolvedValue(justification);

      await expect(
        justificationService.updateJustificationStatus(1, 'APPROVED', 1)
      ).rejects.toThrow('Erro ao atualizar status da justificativa');
    });
  });

  describe('deleteJustification', () => {
    it('should delete justification', async () => {
      const justification = {
        ...mockJustificationData,
        destroy: jest.fn().mockResolvedValue(true),
      };

      (mockJustification.findByPk as jest.Mock).mockResolvedValue(justification);

      const result = await justificationService.deleteJustification(1);

      expect(result).toBe(true);
      expect(justification.destroy).toHaveBeenCalled();
      expect(mockCacheService.del).toHaveBeenCalledWith('justification:1');
      expect(mockCacheService.del).toHaveBeenCalledWith('justifications:point:1');
      expect(mockCacheService.del).toHaveBeenCalledWith('justifications:user:1');
    });

    it('should return false when justification not found', async () => {
      (mockJustification.findByPk as jest.Mock).mockResolvedValue(null);

      const result = await justificationService.deleteJustification(1);

      expect(result).toBe(false);
    });

    it('should throw error when deletion fails', async () => {
      const justification = {
        ...mockJustificationData,
        destroy: jest.fn().mockRejectedValue(new Error('Database error')),
      };

      (mockJustification.findByPk as jest.Mock).mockResolvedValue(justification);

      await expect(justificationService.deleteJustification(1)).rejects.toThrow(
        'Erro ao remover justificativa'
      );
    });
  });
}); 