import { AuditService } from '../../services/audit.service';
import { CacheService } from '../../services/cache.service';
import { NotificationService } from '../../services/notification.service';
import { Op } from 'sequelize';
import { Point } from '../../models/point.model';
import { PointService } from '../../services/point.service';
import { ConfigService } from '../../services/config.service';
import { JustificationService } from '../../services/justification.service';

interface MockNotificationService extends NotificationService {
  notifyManagers: jest.Mock;
  notifyUser: jest.Mock;
}

jest.mock('../../models/point.model');
jest.mock('../../services/cache.service');
jest.mock('../../services/audit.service');
jest.mock('../../services/notification.service');
jest.mock('../../services/config.service');
jest.mock('../../services/justification.service');

describe('PointService', () => {
  let pointService: PointService;
  let mockPoint: jest.Mocked<typeof Point>;
  let mockCacheService: jest.Mocked<CacheService>;
  let mockAuditService: jest.Mocked<AuditService>;
  let mockNotificationService: MockNotificationService;
  let configService: ConfigService;
  let justificationService: JustificationService;

  const mockPointData = {
    id: '1',
    userId: 'user-1',
    companyId: 'company-1',
    departmentId: 'department-1',
    scheduleId: 'schedule-1',
    type: 'ENTRY',
    latitude: -23.5505,
    longitude: -46.6333,
    address: 'São Paulo, SP',
    photoUrl: 'https://example.com/photo.jpg',
    status: 'PENDING',
    createdAt: new Date(),
    updatedAt: new Date(),
    user: {
      id: 'user-1',
      name: 'John Doe',
      email: 'john@example.com',
    },
    company: {
      id: 'company-1',
      name: 'Company A',
    },
    department: {
      id: 'department-1',
      name: 'Development',
    },
    schedule: {
      id: 'schedule-1',
      startTime: '09:00',
      endTime: '18:00',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    pointService = PointService.getInstance();
    mockPoint = Point as jest.Mocked<typeof Point>;
    mockCacheService = CacheService.getInstance() as jest.Mocked<CacheService>;
    mockAuditService = AuditService.getInstance() as jest.Mocked<AuditService>;
    mockNotificationService = NotificationService.getInstance() as unknown as MockNotificationService;
    configService = ConfigService.getInstance();
    justificationService = JustificationService.getInstance();

    // Definindo os métodos do NotificationService
    (mockNotificationService.notifyManagers as jest.Mock) = jest.fn();
    (mockNotificationService.notifyUser as jest.Mock) = jest.fn();
  });

  describe('createPoint', () => {
    it('should create a new point record', async () => {
      const pointData = {
        userId: 1,
        companyId: 1,
        departmentId: 1,
        scheduleId: 1,
        type: 'ENTRY' as const,
        latitude: -23.5505,
        longitude: -46.6333,
        address: 'Rua Teste, 123',
      };

      const createdPoint = {
        id: 1,
        ...pointData,
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockPoint.create as jest.Mock).mockResolvedValue(createdPoint);

      const result = await pointService.createPoint(pointData, 1);

      expect(result).toEqual(createdPoint);
      expect(mockPoint.create).toHaveBeenCalledWith(pointData);
      expect(mockAuditService.logAction).toHaveBeenCalledWith(
        1,
        'Point',
        1,
        'CREATE',
        null,
        pointData
      );
      expect(mockNotificationService.notifyManagers).toHaveBeenCalledWith(
        1,
        1,
        'NOVO_REGISTRO_PONTO',
        {
          userId: 1,
          type: 'ENTRY',
          timestamp: createdPoint.createdAt,
        }
      );
    });

    it('should throw error when creation fails', async () => {
      const pointData = {
        userId: 1,
        companyId: 1,
        departmentId: 1,
        scheduleId: 1,
        type: 'ENTRY' as const,
        latitude: -23.5505,
        longitude: -46.6333,
        address: 'Rua Teste, 123',
      };

      (mockPoint.create as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(pointService.createPoint(pointData, 1)).rejects.toThrow(
        'Erro ao criar registro de ponto'
      );
    });
  });

  describe('getPointById', () => {
    it('should return point from cache', async () => {
      const cachedPoint = {
        id: 1,
        userId: 1,
        type: 'ENTRY',
        status: 'PENDING',
      };

      mockCacheService.getJson.mockResolvedValue(cachedPoint);

      const result = await pointService.getPointById(1);

      expect(result).toEqual(cachedPoint);
      expect(mockCacheService.getJson).toHaveBeenCalledWith('point:1');
      expect(mockPoint.findByPk).not.toHaveBeenCalled();
    });

    it('should fetch point from database and cache it', async () => {
      const point = {
        id: 1,
        userId: 1,
        type: 'ENTRY',
        status: 'PENDING',
      };

      mockCacheService.getJson.mockResolvedValue(null);
      (mockPoint.findByPk as jest.Mock).mockResolvedValue(point);

      const result = await pointService.getPointById(1);

      expect(result).toEqual(point);
      expect(mockPoint.findByPk).toHaveBeenCalledWith(1);
      expect(mockCacheService.setJson).toHaveBeenCalledWith('point:1', point, 3600);
    });

    it('should throw error when fetch fails', async () => {
      mockCacheService.getJson.mockResolvedValue(null);
      (mockPoint.findByPk as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(pointService.getPointById(1)).rejects.toThrow(
        'Erro ao buscar registro de ponto'
      );
    });
  });

  describe('updatePointStatus', () => {
    it('should update point status and notify user', async () => {
      const point = {
        id: 1,
        userId: 1,
        status: 'PENDING',
        toJSON: () => ({ id: 1, status: 'PENDING' }),
        update: jest.fn(),
      };

      (mockPoint.findByPk as jest.Mock).mockResolvedValue(point);
      point.update.mockResolvedValue({ ...point, status: 'APPROVED' });

      const result = await pointService.updatePointStatus(1, 'APPROVED', 1);

      expect(result).toEqual({ ...point, status: 'APPROVED' });
      expect(point.update).toHaveBeenCalledWith({ status: 'APPROVED' });
      expect(mockAuditService.logAction).toHaveBeenCalledWith(
        1,
        'Point',
        1,
        'UPDATE',
        { id: 1, status: 'PENDING' },
        { status: 'APPROVED' }
      );
      expect(mockNotificationService.notifyUser).toHaveBeenCalledWith(
        1,
        'STATUS_REGISTRO_PONTO',
        {
          pointId: 1,
          status: 'APPROVED',
          timestamp: expect.any(Date),
        }
      );
      expect(mockCacheService.del).toHaveBeenCalledWith('point:1');
    });

    it('should return null when point not found', async () => {
      (mockPoint.findByPk as jest.Mock).mockResolvedValue(null);

      const result = await pointService.updatePointStatus(1, 'APPROVED', 1);

      expect(result).toBeNull();
      expect(mockAuditService.logAction).not.toHaveBeenCalled();
      expect(mockNotificationService.notifyUser).not.toHaveBeenCalled();
    });

    it('should throw error when update fails', async () => {
      const point = {
        id: 1,
        userId: 1,
        status: 'PENDING',
        toJSON: () => ({ id: 1, status: 'PENDING' }),
        update: jest.fn().mockRejectedValue(new Error('Database error')),
      };

      (mockPoint.findByPk as jest.Mock).mockResolvedValue(point);

      await expect(pointService.updatePointStatus(1, 'APPROVED', 1)).rejects.toThrow(
        'Erro ao atualizar status do registro de ponto'
      );
    });
  });

  describe('listPoints', () => {
    it('should list points with filters', async () => {
      const points = [
        { id: 1, userId: 1, type: 'ENTRY', status: 'PENDING' },
        { id: 2, userId: 1, type: 'EXIT', status: 'PENDING' },
      ];

      (mockPoint.findAndCountAll as jest.Mock).mockResolvedValue({
        count: 2,
        rows: points,
      });

      const result = await pointService.listPoints(1, 1, 1, 'PENDING', 1, 10);

      expect(result).toEqual({
        points,
        total: 2,
      });
      expect(mockPoint.findAndCountAll).toHaveBeenCalledWith({
        where: {
          userId: 1,
          companyId: 1,
          departmentId: 1,
          status: 'PENDING',
        },
        limit: 10,
        offset: 0,
        order: [['createdAt', 'DESC']],
      });
    });

    it('should throw error when listing fails', async () => {
      (mockPoint.findAndCountAll as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(pointService.listPoints()).rejects.toThrow(
        'Erro ao listar registros de ponto'
      );
    });
  });

  describe('getPointsByUserAndDate', () => {
    it('should return points from cache', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');
      const cachedPoints = [{ id: 1, userId: 1, type: 'ENTRY', status: 'PENDING' }];

      mockCacheService.getJson.mockResolvedValue(cachedPoints);

      const result = await pointService.getPointsByUserAndDate(1, startDate, endDate);

      expect(result).toEqual(cachedPoints);
      expect(mockCacheService.getJson).toHaveBeenCalledWith(
        `points:user:1:${startDate.toISOString()}:${endDate.toISOString()}`
      );
      expect(mockPoint.findAll).not.toHaveBeenCalled();
    });

    it('should fetch points from database and cache them', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');
      const points = [{ id: 1, userId: 1, type: 'ENTRY', status: 'PENDING' }];

      mockCacheService.getJson.mockResolvedValue(null);
      (mockPoint.findAll as jest.Mock).mockResolvedValue(points);

      const result = await pointService.getPointsByUserAndDate(1, startDate, endDate);

      expect(result).toEqual(points);
      expect(mockPoint.findAll).toHaveBeenCalledWith({
        where: {
          userId: 1,
          createdAt: {
            [Op.between]: [startDate, endDate],
          },
        },
        order: [['createdAt', 'ASC']],
      });
      expect(mockCacheService.setJson).toHaveBeenCalledWith(
        `points:user:1:${startDate.toISOString()}:${endDate.toISOString()}`,
        points,
        3600
      );
    });

    it('should throw error when fetch fails', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      mockCacheService.getJson.mockResolvedValue(null);
      (mockPoint.findAll as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(pointService.getPointsByUserAndDate(1, startDate, endDate)).rejects.toThrow(
        'Erro ao buscar registros de ponto por usuário e data'
      );
    });
  });

  describe('getLastPointByUser', () => {
    it('should return last point from cache', async () => {
      const cachedPoint = {
        id: 1,
        userId: 1,
        type: 'ENTRY',
        status: 'PENDING',
      };

      mockCacheService.getJson.mockResolvedValue(cachedPoint);

      const result = await pointService.getLastPointByUser(1);

      expect(result).toEqual(cachedPoint);
      expect(mockCacheService.getJson).toHaveBeenCalledWith('point:last:1');
      expect(mockPoint.findOne).not.toHaveBeenCalled();
    });

    it('should fetch last point from database and cache it', async () => {
      const point = {
        id: 1,
        userId: 1,
        type: 'ENTRY',
        status: 'PENDING',
      };

      mockCacheService.getJson.mockResolvedValue(null);
      (mockPoint.findOne as jest.Mock).mockResolvedValue(point);

      const result = await pointService.getLastPointByUser(1);

      expect(result).toEqual(point);
      expect(mockPoint.findOne).toHaveBeenCalledWith({
        where: { userId: 1 },
        order: [['createdAt', 'DESC']],
      });
      expect(mockCacheService.setJson).toHaveBeenCalledWith('point:last:1', point, 3600);
    });

    it('should throw error when fetch fails', async () => {
      mockCacheService.getJson.mockResolvedValue(null);
      (mockPoint.findOne as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(pointService.getLastPointByUser(1)).rejects.toThrow(
        'Erro ao buscar último registro de ponto do usuário'
      );
    });
  });

  describe('getPoint', () => {
    it('should return point from cache', async () => {
      (mockCacheService.getJson as jest.Mock).mockResolvedValue(mockPointData);

      const result = await pointService.getPoint('1');

      expect(mockCacheService.getJson).toHaveBeenCalledWith('point:1');
      expect(mockPoint.findOne).not.toHaveBeenCalled();
      expect(result).toEqual(mockPointData);
    });

    it('should fetch from database and cache when not in cache', async () => {
      (mockCacheService.getJson as jest.Mock).mockResolvedValue(null);
      (mockPoint.findOne as jest.Mock).mockResolvedValue(mockPointData);
      (mockCacheService.setJson as jest.Mock).mockResolvedValue(true);

      const result = await pointService.getPoint('1');

      expect(mockCacheService.getJson).toHaveBeenCalledWith('point:1');
      expect(mockPoint.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        include: expect.any(Array),
      });
      expect(mockCacheService.setJson).toHaveBeenCalledWith('point:1', mockPointData, 3600);
      expect(result).toEqual(mockPointData);
    });

    it('should throw error when fetch fails', async () => {
      (mockCacheService.getJson as jest.Mock).mockResolvedValue(null);
      (mockPoint.findOne as jest.Mock).mockRejectedValue(new Error('Fetch failed'));

      await expect(pointService.getPoint('1')).rejects.toThrow(
        'Erro ao obter registro de ponto'
      );
    });
  });

  describe('getPointsByUser', () => {
    it('should return points from cache', async () => {
      (mockCacheService.getJson as jest.Mock).mockResolvedValue([mockPointData]);

      const result = await pointService.getPointsByUser('user-1');

      expect(mockCacheService.getJson).toHaveBeenCalledWith('points:user-1');
      expect(mockPoint.findAll).not.toHaveBeenCalled();
      expect(result).toEqual([mockPointData]);
    });

    it('should fetch from database and cache when not in cache', async () => {
      (mockCacheService.getJson as jest.Mock).mockResolvedValue(null);
      (mockPoint.findAll as jest.Mock).mockResolvedValue([mockPointData]);
      (mockCacheService.setJson as jest.Mock).mockResolvedValue(true);

      const result = await pointService.getPointsByUser('user-1');

      expect(mockCacheService.getJson).toHaveBeenCalledWith('points:user-1');
      expect(mockPoint.findAll).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        include: expect.any(Array),
      });
      expect(mockCacheService.setJson).toHaveBeenCalledWith('points:user-1', [mockPointData], 3600);
      expect(result).toEqual([mockPointData]);
    });

    it('should throw error when fetch fails', async () => {
      (mockCacheService.getJson as jest.Mock).mockResolvedValue(null);
      (mockPoint.findAll as jest.Mock).mockRejectedValue(new Error('Fetch failed'));

      await expect(pointService.getPointsByUser('user-1')).rejects.toThrow(
        'Erro ao obter registros de ponto do usuário'
      );
    });
  });

  describe('getPointsByCompany', () => {
    it('should return points from cache', async () => {
      (mockCacheService.getJson as jest.Mock).mockResolvedValue([mockPointData]);

      const result = await pointService.getPointsByCompany('company-1');

      expect(mockCacheService.getJson).toHaveBeenCalledWith('points:company-1');
      expect(mockPoint.findAll).not.toHaveBeenCalled();
      expect(result).toEqual([mockPointData]);
    });

    it('should fetch from database and cache when not in cache', async () => {
      (mockCacheService.getJson as jest.Mock).mockResolvedValue(null);
      (mockPoint.findAll as jest.Mock).mockResolvedValue([mockPointData]);
      (mockCacheService.setJson as jest.Mock).mockResolvedValue(true);

      const result = await pointService.getPointsByCompany('company-1');

      expect(mockCacheService.getJson).toHaveBeenCalledWith('points:company-1');
      expect(mockPoint.findAll).toHaveBeenCalledWith({
        where: { companyId: 'company-1' },
        include: expect.any(Array),
      });
      expect(mockCacheService.setJson).toHaveBeenCalledWith('points:company-1', [mockPointData], 3600);
      expect(result).toEqual([mockPointData]);
    });

    it('should throw error when fetch fails', async () => {
      (mockCacheService.getJson as jest.Mock).mockResolvedValue(null);
      (mockPoint.findAll as jest.Mock).mockRejectedValue(new Error('Fetch failed'));

      await expect(pointService.getPointsByCompany('company-1')).rejects.toThrow(
        'Erro ao obter registros de ponto da empresa'
      );
    });
  });

  describe('updatePoint', () => {
    it('should update point successfully', async () => {
      const updateData = {
        status: 'APPROVED',
        latitude: -23.5506,
        longitude: -46.6334,
      };

      (mockPoint.update as jest.Mock).mockResolvedValue([1, [mockPointData]]);
      (mockCacheService.del as jest.Mock).mockResolvedValue(true);

      const result = await pointService.updatePoint('1', updateData);

      expect(mockPoint.update).toHaveBeenCalledWith(updateData, {
        where: { id: '1' },
        returning: true,
      });
      expect(mockCacheService.del).toHaveBeenCalledWith('point:1');
      expect(mockCacheService.del).toHaveBeenCalledWith('points:user-1');
      expect(mockCacheService.del).toHaveBeenCalledWith('points:company-1');
      expect(mockCacheService.del).toHaveBeenCalledWith('points:department-1');
      expect(result).toEqual(mockPointData);
    });

    it('should return null when no point is updated', async () => {
      const updateData = {
        status: 'APPROVED',
      };

      (mockPoint.update as jest.Mock).mockResolvedValue([0, []]);

      const result = await pointService.updatePoint('1', updateData);

      expect(result).toBeNull();
    });

    it('should throw error when update fails', async () => {
      const updateData = {
        status: 'APPROVED',
      };

      (mockPoint.update as jest.Mock).mockRejectedValue(new Error('Update failed'));

      await expect(pointService.updatePoint('1', updateData)).rejects.toThrow(
        'Erro ao atualizar registro de ponto'
      );
    });
  });

  describe('deletePoint', () => {
    it('should delete point successfully', async () => {
      (mockPoint.destroy as jest.Mock).mockResolvedValue(1);
      (mockCacheService.del as jest.Mock).mockResolvedValue(true);

      const result = await pointService.deletePoint('1');

      expect(mockPoint.destroy).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(mockCacheService.del).toHaveBeenCalledWith('point:1');
      expect(mockCacheService.del).toHaveBeenCalledWith('points:user-1');
      expect(mockCacheService.del).toHaveBeenCalledWith('points:company-1');
      expect(mockCacheService.del).toHaveBeenCalledWith('points:department-1');
      expect(result).toBe(true);
    });

    it('should return false when no point is deleted', async () => {
      (mockPoint.destroy as jest.Mock).mockResolvedValue(0);

      const result = await pointService.deletePoint('1');

      expect(result).toBe(false);
    });

    it('should throw error when deletion fails', async () => {
      (mockPoint.destroy as jest.Mock).mockRejectedValue(new Error('Deletion failed'));

      await expect(pointService.deletePoint('1')).rejects.toThrow(
        'Erro ao remover registro de ponto'
      );
    });
  });

  describe('getPointsByDate', () => {
    it('should return points by date', async () => {
      const date = new Date();
      (mockPoint.findAll as jest.Mock).mockResolvedValue([mockPointData]);

      const result = await pointService.getPointsByDate('user-1', date);

      expect(mockPoint.findAll).toHaveBeenCalledWith({
        where: {
          userId: 'user-1',
          createdAt: {
            [Point.sequelize.Op.between]: [
              new Date(date.setHours(0, 0, 0, 0)),
              new Date(date.setHours(23, 59, 59, 999)),
            ],
          },
        },
        include: expect.any(Array),
      });
      expect(result).toEqual([mockPointData]);
    });

    it('should return empty array when no points are found', async () => {
      const date = new Date();
      (mockPoint.findAll as jest.Mock).mockResolvedValue([]);

      const result = await pointService.getPointsByDate('user-1', date);

      expect(result).toEqual([]);
    });

    it('should throw error when fetch fails', async () => {
      const date = new Date();
      (mockPoint.findAll as jest.Mock).mockRejectedValue(new Error('Fetch failed'));

      await expect(pointService.getPointsByDate('user-1', date)).rejects.toThrow(
        'Erro ao obter registros de ponto por data'
      );
    });
  });

  describe('getPointsByDateRange', () => {
    it('should return points by date range', async () => {
      const startDate = new Date();
      const endDate = new Date();
      (mockPoint.findAll as jest.Mock).mockResolvedValue([mockPointData]);

      const result = await pointService.getPointsByDateRange('user-1', startDate, endDate);

      expect(mockPoint.findAll).toHaveBeenCalledWith({
        where: {
          userId: 'user-1',
          createdAt: {
            [Point.sequelize.Op.between]: [startDate, endDate],
          },
        },
        include: expect.any(Array),
      });
      expect(result).toEqual([mockPointData]);
    });

    it('should return empty array when no points are found', async () => {
      const startDate = new Date();
      const endDate = new Date();
      (mockPoint.findAll as jest.Mock).mockResolvedValue([]);

      const result = await pointService.getPointsByDateRange('user-1', startDate, endDate);

      expect(result).toEqual([]);
    });

    it('should throw error when fetch fails', async () => {
      const startDate = new Date();
      const endDate = new Date();
      (mockPoint.findAll as jest.Mock).mockRejectedValue(new Error('Fetch failed'));

      await expect(
        pointService.getPointsByDateRange('user-1', startDate, endDate)
      ).rejects.toThrow('Erro ao obter registros de ponto por período');
    });
  });

  describe('validatePoint', () => {
    it('should validate point successfully', async () => {
      const point = {
        ...mockPointData,
        type: 'ENTRY',
        createdAt: new Date('2024-01-01T09:00:00Z'),
      };

      (configService.getLateTolerance as jest.Mock).mockResolvedValue(15);
      (configService.isConfigActive as jest.Mock).mockResolvedValue(true);

      const result = await pointService.validatePoint(point);

      expect(result).toEqual({
        isValid: true,
        isLate: false,
        requiresJustification: false,
      });
    });

    it('should detect late entry', async () => {
      const point = {
        ...mockPointData,
        type: 'ENTRY',
        createdAt: new Date('2024-01-01T09:30:00Z'),
      };

      (configService.getLateTolerance as jest.Mock).mockResolvedValue(15);
      (configService.isConfigActive as jest.Mock).mockResolvedValue(true);

      const result = await pointService.validatePoint(point);

      expect(result).toEqual({
        isValid: true,
        isLate: true,
        requiresJustification: true,
      });
    });

    it('should detect missing photo', async () => {
      const point = {
        ...mockPointData,
        type: 'ENTRY',
        photoUrl: null,
      };

      (configService.getLateTolerance as jest.Mock).mockResolvedValue(15);
      (configService.isConfigActive as jest.Mock).mockResolvedValue(true);

      const result = await pointService.validatePoint(point);

      expect(result).toEqual({
        isValid: false,
        isLate: false,
        requiresJustification: false,
        errors: ['Foto é obrigatória'],
      });
    });

    it('should detect missing location', async () => {
      const point = {
        ...mockPointData,
        type: 'ENTRY',
        latitude: null,
        longitude: null,
      };

      (configService.getLateTolerance as jest.Mock).mockResolvedValue(15);
      (configService.isConfigActive as jest.Mock).mockResolvedValue(true);

      const result = await pointService.validatePoint(point);

      expect(result).toEqual({
        isValid: false,
        isLate: false,
        requiresJustification: false,
        errors: ['Localização é obrigatória'],
      });
    });
  });
}); 