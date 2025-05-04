import { format } from 'date-fns';

import { AuditService } from '../../services/audit.service';
import { CacheService } from '../../services/cache.service';
import { NotificationService } from '../../services/notification.service';
import { Point } from '../../models/point.model';
import { ReportService } from '../../services/report.service';

jest.mock('../../models/point.model');
jest.mock('../../services/cache.service');
jest.mock('../../services/audit.service');
jest.mock('../../services/notification.service');

describe('ReportService', () => {
  let reportService: ReportService;
  let mockPoint: jest.Mocked<typeof Point>;
  let mockCacheService: jest.Mocked<CacheService>;
  let mockAuditService: jest.Mocked<AuditService>;
  let mockNotificationService: jest.Mocked<NotificationService>;

  beforeEach(() => {
    mockPoint = Point as jest.Mocked<typeof Point>;
    mockCacheService = {
      get: jest.fn(),
      set: jest.fn()
    } as unknown as jest.Mocked<CacheService>;
    mockAuditService = {
      log: jest.fn()
    } as unknown as jest.Mocked<AuditService>;
    mockNotificationService = {
      notifyManagers: jest.fn(),
      notifyUser: jest.fn()
    } as unknown as jest.Mocked<NotificationService>;

    reportService = ReportService.getInstance();
    (reportService as any).cacheService = mockCacheService;
    (reportService as any).auditService = mockAuditService;
    (reportService as any).notificationService = mockNotificationService;
  });

  describe('generateDailyReport', () => {
    it('should return cached report if available', async () => {
      const date = new Date();
      const cachedReport = { date: '01/01/2024', totalPoints: 2, points: [] };
      
      (mockCacheService.get as jest.Mock).mockResolvedValue(cachedReport);

      const result = await reportService.generateDailyReport(date);

      expect(result).toEqual(cachedReport);
      expect(mockCacheService.get).toHaveBeenCalledWith(
        `daily-report:${format(date, 'yyyy-MM-dd')}:{}`
      );
      expect(mockPoint.findAll).not.toHaveBeenCalled();
    });

    it('should generate and cache new report if not cached', async () => {
      const date = new Date();
      const points = [
        {
          id: '1',
          User: { name: 'John Doe', email: 'john@example.com' },
          Company: { name: 'Company A' },
          Department: { name: 'Department A' },
          type: 'ENTRY',
          createdAt: new Date(),
          status: 'APPROVED'
        }
      ];

      (mockCacheService.get as jest.Mock).mockResolvedValue(null);
      (mockPoint.findAll as jest.Mock).mockResolvedValue(points);
      (mockCacheService.set as jest.Mock).mockResolvedValue(true);
      (mockAuditService.log as jest.Mock).mockResolvedValue(true);

      const result = await reportService.generateDailyReport(date);

      expect(result).toHaveProperty('date', format(date, 'dd/MM/yyyy'));
      expect(result).toHaveProperty('totalPoints', 1);
      expect(result.points).toHaveLength(1);
      expect(mockCacheService.set).toHaveBeenCalled();
      expect(mockAuditService.log).toHaveBeenCalled();
    });
  });

  describe('generateWeeklyReport', () => {
    it('should return cached report if available', async () => {
      const date = new Date();
      const cachedReport = { week: '01/01/2024 - 07/01/2024', totalPoints: 2, points: [] };
      
      (mockCacheService.get as jest.Mock).mockResolvedValue(cachedReport);

      const result = await reportService.generateWeeklyReport(date);

      expect(result).toEqual(cachedReport);
      expect(mockCacheService.get).toHaveBeenCalledWith(
        `weekly-report:${format(date, 'yyyy-MM-dd')}:{}`
      );
      expect(mockPoint.findAll).not.toHaveBeenCalled();
    });

    it('should generate and cache new report if not cached', async () => {
      const date = new Date();
      const points = [
        {
          id: '1',
          User: { name: 'John Doe', email: 'john@example.com' },
          Company: { name: 'Company A' },
          Department: { name: 'Department A' },
          type: 'ENTRY',
          createdAt: new Date(),
          status: 'APPROVED'
        }
      ];

      (mockCacheService.get as jest.Mock).mockResolvedValue(null);
      (mockPoint.findAll as jest.Mock).mockResolvedValue(points);
      (mockCacheService.set as jest.Mock).mockResolvedValue(true);
      (mockAuditService.log as jest.Mock).mockResolvedValue(true);

      const result = await reportService.generateWeeklyReport(date);

      expect(result).toHaveProperty('week');
      expect(result).toHaveProperty('totalPoints', 1);
      expect(result.points).toHaveLength(1);
      expect(mockCacheService.set).toHaveBeenCalled();
      expect(mockAuditService.log).toHaveBeenCalled();
    });
  });

  describe('generateMonthlyReport', () => {
    it('should return cached report if available', async () => {
      const date = new Date();
      const cachedReport = { month: 'Janeiro 2024', totalPoints: 2, points: [] };
      
      (mockCacheService.get as jest.Mock).mockResolvedValue(cachedReport);

      const result = await reportService.generateMonthlyReport(date);

      expect(result).toEqual(cachedReport);
      expect(mockCacheService.get).toHaveBeenCalledWith(
        `monthly-report:${format(date, 'yyyy-MM')}:{}`
      );
      expect(mockPoint.findAll).not.toHaveBeenCalled();
    });

    it('should generate and cache new report if not cached', async () => {
      const date = new Date();
      const points = [
        {
          id: '1',
          User: { name: 'John Doe', email: 'john@example.com' },
          Company: { name: 'Company A' },
          Department: { name: 'Department A' },
          type: 'ENTRY',
          createdAt: new Date(),
          status: 'APPROVED'
        }
      ];

      (mockCacheService.get as jest.Mock).mockResolvedValue(null);
      (mockPoint.findAll as jest.Mock).mockResolvedValue(points);
      (mockCacheService.set as jest.Mock).mockResolvedValue(true);
      (mockAuditService.log as jest.Mock).mockResolvedValue(true);

      const result = await reportService.generateMonthlyReport(date);

      expect(result).toHaveProperty('month');
      expect(result).toHaveProperty('totalPoints', 1);
      expect(result.points).toHaveLength(1);
      expect(mockCacheService.set).toHaveBeenCalled();
      expect(mockAuditService.log).toHaveBeenCalled();
    });
  });

  describe('calculateWorkHours', () => {
    it('should calculate work hours correctly', async () => {
      const userId = '1';
      const startDate = new Date();
      const endDate = new Date();
      const points = [
        {
          id: '1',
          type: 'ENTRY',
          createdAt: new Date('2024-01-01T08:00:00')
        },
        {
          id: '2',
          type: 'EXIT',
          createdAt: new Date('2024-01-01T17:00:00')
        }
      ];

      (mockPoint.findAll as jest.Mock).mockResolvedValue(points);

      const result = await reportService.calculateWorkHours(userId, startDate, endDate);

      expect(result).toEqual({
        totalHours: 9,
        regularHours: 8,
        overtimeHours: 1,
        missingHours: 0
      });
    });

    it('should handle missing exit point', async () => {
      const userId = '1';
      const startDate = new Date();
      const endDate = new Date();
      const points = [
        {
          id: '1',
          type: 'ENTRY',
          createdAt: new Date('2024-01-01T08:00:00')
        }
      ];

      (mockPoint.findAll as jest.Mock).mockResolvedValue(points);

      const result = await reportService.calculateWorkHours(userId, startDate, endDate);

      expect(result).toEqual({
        totalHours: 0,
        regularHours: 0,
        overtimeHours: 0,
        missingHours: 0
      });
    });
  });

  describe('exportToExcel', () => {
    it('should generate Excel file with correct data', async () => {
      const report = {
        points: [
          {
            id: '1',
            user: 'John Doe',
            company: 'Company A',
            department: 'Department A',
            type: 'ENTRY',
            date: '01/01/2024',
            time: '08:00',
            status: 'APPROVED'
          }
        ]
      };

      const result = await reportService.exportToExcel(report, 'daily');

      expect(result).toBeInstanceOf(Buffer);
    });
  });

  describe('exportToPDF', () => {
    it('should generate PDF file with correct data', async () => {
      const report = {
        points: [
          {
            id: '1',
            user: 'John Doe',
            company: 'Company A',
            department: 'Department A',
            type: 'ENTRY',
            date: '01/01/2024',
            time: '08:00',
            status: 'APPROVED'
          }
        ]
      };

      const result = await reportService.exportToPDF(report, 'daily');

      expect(result).toBeInstanceOf(Buffer);
    });
  });
}); 