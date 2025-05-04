import { Point } from '../models/point.model';
import { CacheService } from './cache.service';
import { AuditService } from './audit.service';
import { NotificationService } from './notification.service';

export class PointService {
  private static instance: PointService;
  private cacheService: CacheService;
  private auditService: AuditService;
  private notificationService: NotificationService;

  private constructor() {
    this.cacheService = CacheService.getInstance();
    this.auditService = AuditService.getInstance();
    this.notificationService = NotificationService.getInstance();
  }

  public static getInstance(): PointService {
    if (!PointService.instance) {
      PointService.instance = new PointService();
    }
    return PointService.instance;
  }

  public async createPoint(data: {
    userId: number;
    companyId: number;
    departmentId: number;
    scheduleId: number;
    type: 'ENTRY' | 'EXIT';
    latitude: number;
    longitude: number;
    address: string;
    photoUrl?: string;
  }, userId: number): Promise<Point> {
    try {
      const point = await Point.create(data);
      
      await this.auditService.logAction(
        userId,
        'Point',
        point.id,
        'CREATE',
        null,
        data
      );

      // Notificar gestores sobre novo registro de ponto
      await this.notificationService.notifyManagers(
        point.companyId,
        point.departmentId,
        'NOVO_REGISTRO_PONTO',
        {
          userId: point.userId,
          type: point.type,
          timestamp: point.createdAt,
        }
      );

      return point;
    } catch (error) {
      throw new Error('Erro ao criar registro de ponto');
    }
  }

  public async getPointById(id: number): Promise<Point | null> {
    try {
      const cacheKey = `point:${id}`;
      const cachedPoint = await this.cacheService.getJson<Point>(cacheKey);
      
      if (cachedPoint) {
        return cachedPoint;
      }

      const point = await Point.findByPk(id);
      if (point) {
        await this.cacheService.setJson(cacheKey, point, 3600); // Cache por 1 hora
      }
      return point;
    } catch (error) {
      throw new Error('Erro ao buscar registro de ponto');
    }
  }

  public async updatePointStatus(
    id: number,
    status: 'APPROVED' | 'REJECTED',
    userId: number
  ): Promise<Point | null> {
    try {
      const point = await Point.findByPk(id);
      if (!point) {
        return null;
      }

      const oldData = point.toJSON();
      await point.update({ status });
      
      await this.auditService.logAction(
        userId,
        'Point',
        id,
        'UPDATE',
        oldData,
        { status }
      );

      // Notificar usuário sobre atualização do status
      await this.notificationService.notifyUser(
        point.userId,
        'STATUS_REGISTRO_PONTO',
        {
          pointId: point.id,
          status: point.status,
          timestamp: point.updatedAt,
        }
      );

      const cacheKey = `point:${id}`;
      await this.cacheService.del(cacheKey);

      return point;
    } catch (error) {
      throw new Error('Erro ao atualizar status do registro de ponto');
    }
  }

  public async listPoints(
    userId?: number,
    companyId?: number,
    departmentId?: number,
    status?: 'PENDING' | 'APPROVED' | 'REJECTED',
    page: number = 1,
    limit: number = 10
  ): Promise<{ points: Point[]; total: number }> {
    try {
      const offset = (page - 1) * limit;
      const where: any = {};
      
      if (userId) where.userId = userId;
      if (companyId) where.companyId = companyId;
      if (departmentId) where.departmentId = departmentId;
      if (status) where.status = status;

      const { count, rows } = await Point.findAndCountAll({
        where,
        limit,
        offset,
        order: [['createdAt', 'DESC']],
      });

      return {
        points: rows,
        total: count,
      };
    } catch (error) {
      throw new Error('Erro ao listar registros de ponto');
    }
  }

  public async getPointsByUserAndDate(
    userId: number,
    startDate: Date,
    endDate: Date
  ): Promise<Point[]> {
    try {
      const cacheKey = `points:user:${userId}:${startDate.toISOString()}:${endDate.toISOString()}`;
      const cachedPoints = await this.cacheService.getJson<Point[]>(cacheKey);
      
      if (cachedPoints) {
        return cachedPoints;
      }

      const points = await Point.findAll({
        where: {
          userId,
          createdAt: {
            [Op.between]: [startDate, endDate],
          },
        },
        order: [['createdAt', 'ASC']],
      });

      await this.cacheService.setJson(cacheKey, points, 3600); // Cache por 1 hora

      return points;
    } catch (error) {
      throw new Error('Erro ao buscar registros de ponto por usuário e data');
    }
  }

  public async getLastPointByUser(userId: number): Promise<Point | null> {
    try {
      const cacheKey = `point:last:${userId}`;
      const cachedPoint = await this.cacheService.getJson<Point>(cacheKey);
      
      if (cachedPoint) {
        return cachedPoint;
      }

      const point = await Point.findOne({
        where: { userId },
        order: [['createdAt', 'DESC']],
      });

      if (point) {
        await this.cacheService.setJson(cacheKey, point, 3600); // Cache por 1 hora
      }

      return point;
    } catch (error) {
      throw new Error('Erro ao buscar último registro de ponto do usuário');
    }
  }
} 