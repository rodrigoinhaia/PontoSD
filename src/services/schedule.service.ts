import { Horario } from '../models/horario.model';
import { CacheService } from './cache.service';
import { AuditService } from './audit.service';

export class ScheduleService {
  private static instance: ScheduleService;
  private cacheService: CacheService;
  private auditService: AuditService;

  private constructor() {
    this.cacheService = CacheService.getInstance();
    this.auditService = AuditService.getInstance();
  }

  public static getInstance(): ScheduleService {
    if (!ScheduleService.instance) {
      ScheduleService.instance = new ScheduleService();
    }
    return ScheduleService.instance;
  }

  public async createSchedule(data: {
    name: string;
    startTime: string;
    endTime: string;
    companyId: number;
    departmentId?: number;
  }, userId: number): Promise<Horario> {
    try {
      const schedule = await Horario.create(data);
      await this.auditService.logAction(
        userId,
        'Horario',
        schedule.id,
        'CREATE',
        null,
        data
      );
      return schedule;
    } catch (error) {
      throw new Error('Erro ao criar horário');
    }
  }

  public async getScheduleById(id: number): Promise<Horario | null> {
    try {
      const cacheKey = `schedule:${id}`;
      const cachedSchedule = await this.cacheService.getJson<Horario>(cacheKey);
      
      if (cachedSchedule) {
        return cachedSchedule;
      }

      const schedule = await Horario.findByPk(id);
      if (schedule) {
        await this.cacheService.setJson(cacheKey, schedule, 3600); // Cache por 1 hora
      }
      return schedule;
    } catch (error) {
      throw new Error('Erro ao buscar horário');
    }
  }

  public async updateSchedule(
    id: number,
    data: {
      name?: string;
      startTime?: string;
      endTime?: string;
      companyId?: number;
      departmentId?: number;
    },
    userId: number
  ): Promise<Horario | null> {
    try {
      const schedule = await Horario.findByPk(id);
      if (!schedule) {
        return null;
      }

      const oldData = schedule.toJSON();
      await schedule.update(data);
      
      await this.auditService.logAction(
        userId,
        'Horario',
        id,
        'UPDATE',
        oldData,
        data
      );

      const cacheKey = `schedule:${id}`;
      await this.cacheService.del(cacheKey);

      return schedule;
    } catch (error) {
      throw new Error('Erro ao atualizar horário');
    }
  }

  public async deleteSchedule(id: number, userId: number): Promise<boolean> {
    try {
      const schedule = await Horario.findByPk(id);
      if (!schedule) {
        return false;
      }

      const oldData = schedule.toJSON();
      await schedule.destroy();

      await this.auditService.logAction(
        userId,
        'Horario',
        id,
        'DELETE',
        oldData,
        null
      );

      const cacheKey = `schedule:${id}`;
      await this.cacheService.del(cacheKey);

      return true;
    } catch (error) {
      throw new Error('Erro ao deletar horário');
    }
  }

  public async listSchedules(
    companyId: number,
    departmentId?: number,
    page: number = 1,
    limit: number = 10
  ): Promise<{ schedules: Horario[]; total: number }> {
    try {
      const offset = (page - 1) * limit;
      const where: any = { companyId };
      
      if (departmentId) {
        where.departmentId = departmentId;
      }

      const { count, rows } = await Horario.findAndCountAll({
        where,
        limit,
        offset,
        order: [['name', 'ASC']],
      });

      return {
        schedules: rows,
        total: count,
      };
    } catch (error) {
      throw new Error('Erro ao listar horários');
    }
  }

  public async getScheduleByNameAndCompany(
    name: string,
    companyId: number
  ): Promise<Horario | null> {
    try {
      const cacheKey = `schedule:${companyId}:${name}`;
      const cachedSchedule = await this.cacheService.getJson<Horario>(cacheKey);
      
      if (cachedSchedule) {
        return cachedSchedule;
      }

      const schedule = await Horario.findOne({
        where: { name, companyId }
      });
      
      if (schedule) {
        await this.cacheService.setJson(cacheKey, schedule, 3600); // Cache por 1 hora
      }
      return schedule;
    } catch (error) {
      throw new Error('Erro ao buscar horário por nome e empresa');
    }
  }
} 