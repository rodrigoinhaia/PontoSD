import { ScheduleService } from '../../services/schedule.service';
import { Horario } from '../../models/horario.model';
import { CacheService } from '../../services/cache.service';
import { AuditService } from '../../services/audit.service';

jest.mock('../../models/horario.model');
jest.mock('../../services/cache.service');
jest.mock('../../services/audit.service');

describe('ScheduleService', () => {
  let scheduleService: ScheduleService;
  let cacheService: jest.Mocked<CacheService>;
  let auditService: jest.Mocked<AuditService>;

  beforeEach(() => {
    jest.clearAllMocks();
    scheduleService = ScheduleService.getInstance();
    cacheService = CacheService.getInstance() as jest.Mocked<CacheService>;
    auditService = AuditService.getInstance() as jest.Mocked<AuditService>;
  });

  describe('createSchedule', () => {
    it('should create a schedule successfully', async () => {
      const mockSchedule = {
        id: 1,
        name: 'Test Schedule',
        startTime: '09:00',
        endTime: '18:00',
        companyId: 1,
        departmentId: 1,
      };

      (Horario.create as jest.Mock).mockResolvedValue(mockSchedule);
      (auditService.logAction as jest.Mock).mockResolvedValue(undefined);

      const result = await scheduleService.createSchedule(
        {
          name: 'Test Schedule',
          startTime: '09:00',
          endTime: '18:00',
          companyId: 1,
          departmentId: 1,
        },
        1
      );

      expect(result).toEqual(mockSchedule);
      expect(Horario.create).toHaveBeenCalledWith({
        name: 'Test Schedule',
        startTime: '09:00',
        endTime: '18:00',
        companyId: 1,
        departmentId: 1,
      });
      expect(auditService.logAction).toHaveBeenCalledWith(
        1,
        'Horario',
        1,
        'CREATE',
        null,
        {
          name: 'Test Schedule',
          startTime: '09:00',
          endTime: '18:00',
          companyId: 1,
          departmentId: 1,
        }
      );
    });

    it('should throw an error when creation fails', async () => {
      (Horario.create as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(
        scheduleService.createSchedule(
          {
            name: 'Test Schedule',
            startTime: '09:00',
            endTime: '18:00',
            companyId: 1,
            departmentId: 1,
          },
          1
        )
      ).rejects.toThrow('Erro ao criar horário');
    });
  });

  describe('getScheduleById', () => {
    it('should return schedule from cache if available', async () => {
      const mockSchedule = {
        id: 1,
        name: 'Test Schedule',
        startTime: '09:00',
        endTime: '18:00',
        companyId: 1,
        departmentId: 1,
      };

      (cacheService.getJson as jest.Mock).mockResolvedValue(mockSchedule);

      const result = await scheduleService.getScheduleById(1);

      expect(result).toEqual(mockSchedule);
      expect(cacheService.getJson).toHaveBeenCalledWith('schedule:1');
      expect(Horario.findByPk).not.toHaveBeenCalled();
    });

    it('should fetch schedule from database and cache it if not in cache', async () => {
      const mockSchedule = {
        id: 1,
        name: 'Test Schedule',
        startTime: '09:00',
        endTime: '18:00',
        companyId: 1,
        departmentId: 1,
      };

      (cacheService.getJson as jest.Mock).mockResolvedValue(null);
      (Horario.findByPk as jest.Mock).mockResolvedValue(mockSchedule);
      (cacheService.setJson as jest.Mock).mockResolvedValue(undefined);

      const result = await scheduleService.getScheduleById(1);

      expect(result).toEqual(mockSchedule);
      expect(cacheService.getJson).toHaveBeenCalledWith('schedule:1');
      expect(Horario.findByPk).toHaveBeenCalledWith(1);
      expect(cacheService.setJson).toHaveBeenCalledWith(
        'schedule:1',
        mockSchedule,
        3600
      );
    });

    it('should throw an error when fetching fails', async () => {
      (cacheService.getJson as jest.Mock).mockResolvedValue(null);
      (Horario.findByPk as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(scheduleService.getScheduleById(1)).rejects.toThrow(
        'Erro ao buscar horário'
      );
    });
  });

  describe('updateSchedule', () => {
    it('should update schedule successfully', async () => {
      const mockSchedule = {
        id: 1,
        name: 'Test Schedule',
        startTime: '09:00',
        endTime: '18:00',
        companyId: 1,
        departmentId: 1,
        update: jest.fn().mockResolvedValue(undefined),
        toJSON: jest.fn().mockReturnValue({
          id: 1,
          name: 'Old Schedule',
          startTime: '08:00',
          endTime: '17:00',
          companyId: 1,
          departmentId: 1,
        }),
      };

      (Horario.findByPk as jest.Mock).mockResolvedValue(mockSchedule);
      (auditService.logAction as jest.Mock).mockResolvedValue(undefined);
      (cacheService.del as jest.Mock).mockResolvedValue(undefined);

      const result = await scheduleService.updateSchedule(
        1,
        {
          name: 'Updated Schedule',
          startTime: '09:00',
          endTime: '18:00',
        },
        1
      );

      expect(result).toEqual(mockSchedule);
      expect(mockSchedule.update).toHaveBeenCalledWith({
        name: 'Updated Schedule',
        startTime: '09:00',
        endTime: '18:00',
      });
      expect(auditService.logAction).toHaveBeenCalledWith(
        1,
        'Horario',
        1,
        'UPDATE',
        {
          id: 1,
          name: 'Old Schedule',
          startTime: '08:00',
          endTime: '17:00',
          companyId: 1,
          departmentId: 1,
        },
        {
          name: 'Updated Schedule',
          startTime: '09:00',
          endTime: '18:00',
        }
      );
      expect(cacheService.del).toHaveBeenCalledWith('schedule:1');
    });

    it('should return null if schedule not found', async () => {
      (Horario.findByPk as jest.Mock).mockResolvedValue(null);

      const result = await scheduleService.updateSchedule(
        1,
        {
          name: 'Updated Schedule',
          startTime: '09:00',
          endTime: '18:00',
        },
        1
      );

      expect(result).toBeNull();
    });

    it('should throw an error when update fails', async () => {
      const mockSchedule = {
        id: 1,
        name: 'Test Schedule',
        startTime: '09:00',
        endTime: '18:00',
        companyId: 1,
        departmentId: 1,
        update: jest.fn().mockRejectedValue(new Error('Database error')),
        toJSON: jest.fn().mockReturnValue({
          id: 1,
          name: 'Old Schedule',
          startTime: '08:00',
          endTime: '17:00',
          companyId: 1,
          departmentId: 1,
        }),
      };

      (Horario.findByPk as jest.Mock).mockResolvedValue(mockSchedule);

      await expect(
        scheduleService.updateSchedule(
          1,
          {
            name: 'Updated Schedule',
            startTime: '09:00',
            endTime: '18:00',
          },
          1
        )
      ).rejects.toThrow('Erro ao atualizar horário');
    });
  });

  describe('deleteSchedule', () => {
    it('should delete schedule successfully', async () => {
      const mockSchedule = {
        id: 1,
        name: 'Test Schedule',
        startTime: '09:00',
        endTime: '18:00',
        companyId: 1,
        departmentId: 1,
        destroy: jest.fn().mockResolvedValue(undefined),
        toJSON: jest.fn().mockReturnValue({
          id: 1,
          name: 'Test Schedule',
          startTime: '09:00',
          endTime: '18:00',
          companyId: 1,
          departmentId: 1,
        }),
      };

      (Horario.findByPk as jest.Mock).mockResolvedValue(mockSchedule);
      (auditService.logAction as jest.Mock).mockResolvedValue(undefined);
      (cacheService.del as jest.Mock).mockResolvedValue(undefined);

      const result = await scheduleService.deleteSchedule(1, 1);

      expect(result).toBe(true);
      expect(mockSchedule.destroy).toHaveBeenCalled();
      expect(auditService.logAction).toHaveBeenCalledWith(
        1,
        'Horario',
        1,
        'DELETE',
        {
          id: 1,
          name: 'Test Schedule',
          startTime: '09:00',
          endTime: '18:00',
          companyId: 1,
          departmentId: 1,
        },
        null
      );
      expect(cacheService.del).toHaveBeenCalledWith('schedule:1');
    });

    it('should return false if schedule not found', async () => {
      (Horario.findByPk as jest.Mock).mockResolvedValue(null);

      const result = await scheduleService.deleteSchedule(1, 1);

      expect(result).toBe(false);
    });

    it('should throw an error when deletion fails', async () => {
      const mockSchedule = {
        id: 1,
        name: 'Test Schedule',
        startTime: '09:00',
        endTime: '18:00',
        companyId: 1,
        departmentId: 1,
        destroy: jest.fn().mockRejectedValue(new Error('Database error')),
        toJSON: jest.fn().mockReturnValue({
          id: 1,
          name: 'Test Schedule',
          startTime: '09:00',
          endTime: '18:00',
          companyId: 1,
          departmentId: 1,
        }),
      };

      (Horario.findByPk as jest.Mock).mockResolvedValue(mockSchedule);

      await expect(scheduleService.deleteSchedule(1, 1)).rejects.toThrow(
        'Erro ao deletar horário'
      );
    });
  });

  describe('listSchedules', () => {
    it('should list schedules successfully', async () => {
      const mockSchedules = [
        {
          id: 1,
          name: 'Schedule 1',
          startTime: '09:00',
          endTime: '18:00',
          companyId: 1,
          departmentId: 1,
        },
        {
          id: 2,
          name: 'Schedule 2',
          startTime: '08:00',
          endTime: '17:00',
          companyId: 1,
          departmentId: 1,
        },
      ];

      (Horario.findAndCountAll as jest.Mock).mockResolvedValue({
        count: 2,
        rows: mockSchedules,
      });

      const result = await scheduleService.listSchedules(1, 1, 1, 10);

      expect(result).toEqual({
        schedules: mockSchedules,
        total: 2,
      });
      expect(Horario.findAndCountAll).toHaveBeenCalledWith({
        where: { companyId: 1, departmentId: 1 },
        limit: 10,
        offset: 0,
        order: [['name', 'ASC']],
      });
    });

    it('should throw an error when listing fails', async () => {
      (Horario.findAndCountAll as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await expect(scheduleService.listSchedules(1, 1, 1, 10)).rejects.toThrow(
        'Erro ao listar horários'
      );
    });
  });

  describe('getScheduleByNameAndCompany', () => {
    it('should return schedule from cache if available', async () => {
      const mockSchedule = {
        id: 1,
        name: 'Test Schedule',
        startTime: '09:00',
        endTime: '18:00',
        companyId: 1,
        departmentId: 1,
      };

      (cacheService.getJson as jest.Mock).mockResolvedValue(mockSchedule);

      const result = await scheduleService.getScheduleByNameAndCompany(
        'Test Schedule',
        1
      );

      expect(result).toEqual(mockSchedule);
      expect(cacheService.getJson).toHaveBeenCalledWith('schedule:1:Test Schedule');
      expect(Horario.findOne).not.toHaveBeenCalled();
    });

    it('should fetch schedule from database and cache it if not in cache', async () => {
      const mockSchedule = {
        id: 1,
        name: 'Test Schedule',
        startTime: '09:00',
        endTime: '18:00',
        companyId: 1,
        departmentId: 1,
      };

      (cacheService.getJson as jest.Mock).mockResolvedValue(null);
      (Horario.findOne as jest.Mock).mockResolvedValue(mockSchedule);
      (cacheService.setJson as jest.Mock).mockResolvedValue(undefined);

      const result = await scheduleService.getScheduleByNameAndCompany(
        'Test Schedule',
        1
      );

      expect(result).toEqual(mockSchedule);
      expect(cacheService.getJson).toHaveBeenCalledWith('schedule:1:Test Schedule');
      expect(Horario.findOne).toHaveBeenCalledWith({
        where: { name: 'Test Schedule', companyId: 1 },
      });
      expect(cacheService.setJson).toHaveBeenCalledWith(
        'schedule:1:Test Schedule',
        mockSchedule,
        3600
      );
    });

    it('should throw an error when fetching fails', async () => {
      (cacheService.getJson as jest.Mock).mockResolvedValue(null);
      (Horario.findOne as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(
        scheduleService.getScheduleByNameAndCompany('Test Schedule', 1)
      ).rejects.toThrow('Erro ao buscar horário por nome e empresa');
    });
  });
}); 