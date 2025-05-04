import { Departamento } from '../models/departamento.model';
import { CacheService } from './cache.service';
import { AuditService } from './audit.service';

export class DepartmentService {
  private static instance: DepartmentService;
  private cacheService: CacheService;
  private auditService: AuditService;

  private constructor() {
    this.cacheService = CacheService.getInstance();
    this.auditService = AuditService.getInstance();
  }

  public static getInstance(): DepartmentService {
    if (!DepartmentService.instance) {
      DepartmentService.instance = new DepartmentService();
    }
    return DepartmentService.instance;
  }

  public async createDepartment(data: {
    name: string;
    companyId: number;
  }, userId: number): Promise<Departamento> {
    try {
      const department = await Departamento.create(data);
      await this.auditService.logAction(
        userId,
        'Departamento',
        department.id,
        'CREATE',
        null,
        data
      );
      return department;
    } catch (error) {
      throw new Error('Erro ao criar departamento');
    }
  }

  public async getDepartmentById(id: number): Promise<Departamento | null> {
    try {
      const cacheKey = `department:${id}`;
      const cachedDepartment = await this.cacheService.getJson<Departamento>(cacheKey);
      
      if (cachedDepartment) {
        return cachedDepartment;
      }

      const department = await Departamento.findByPk(id);
      if (department) {
        await this.cacheService.setJson(cacheKey, department, 3600); // Cache por 1 hora
      }
      return department;
    } catch (error) {
      throw new Error('Erro ao buscar departamento');
    }
  }

  public async updateDepartment(
    id: number,
    data: {
      name?: string;
      companyId?: number;
    },
    userId: number
  ): Promise<Departamento | null> {
    try {
      const department = await Departamento.findByPk(id);
      if (!department) {
        return null;
      }

      const oldData = department.toJSON();
      await department.update(data);
      
      await this.auditService.logAction(
        userId,
        'Departamento',
        id,
        'UPDATE',
        oldData,
        data
      );

      const cacheKey = `department:${id}`;
      await this.cacheService.del(cacheKey);

      return department;
    } catch (error) {
      throw new Error('Erro ao atualizar departamento');
    }
  }

  public async deleteDepartment(id: number, userId: number): Promise<boolean> {
    try {
      const department = await Departamento.findByPk(id);
      if (!department) {
        return false;
      }

      const oldData = department.toJSON();
      await department.destroy();

      await this.auditService.logAction(
        userId,
        'Departamento',
        id,
        'DELETE',
        oldData,
        null
      );

      const cacheKey = `department:${id}`;
      await this.cacheService.del(cacheKey);

      return true;
    } catch (error) {
      throw new Error('Erro ao deletar departamento');
    }
  }

  public async listDepartments(
    companyId: number,
    page: number = 1,
    limit: number = 10
  ): Promise<{ departments: Departamento[]; total: number }> {
    try {
      const offset = (page - 1) * limit;
      const { count, rows } = await Departamento.findAndCountAll({
        where: { companyId },
        limit,
        offset,
        order: [['name', 'ASC']],
      });

      return {
        departments: rows,
        total: count,
      };
    } catch (error) {
      throw new Error('Erro ao listar departamentos');
    }
  }

  public async getDepartmentByNameAndCompany(
    name: string,
    companyId: number
  ): Promise<Departamento | null> {
    try {
      const cacheKey = `department:${companyId}:${name}`;
      const cachedDepartment = await this.cacheService.getJson<Departamento>(cacheKey);
      
      if (cachedDepartment) {
        return cachedDepartment;
      }

      const department = await Departamento.findOne({
        where: { name, companyId }
      });
      
      if (department) {
        await this.cacheService.setJson(cacheKey, department, 3600); // Cache por 1 hora
      }
      return department;
    } catch (error) {
      throw new Error('Erro ao buscar departamento por nome e empresa');
    }
  }
} 