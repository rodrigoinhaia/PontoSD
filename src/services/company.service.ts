import { Empresa } from '../models/empresa.model';
import { CacheService } from './cache.service';
import { AuditService } from './audit.service';

export class CompanyService {
  private static instance: CompanyService;
  private cacheService: CacheService;
  private auditService: AuditService;

  private constructor() {
    this.cacheService = CacheService.getInstance();
    this.auditService = AuditService.getInstance();
  }

  public static getInstance(): CompanyService {
    if (!CompanyService.instance) {
      CompanyService.instance = new CompanyService();
    }
    return CompanyService.instance;
  }

  public async createCompany(data: {
    name: string;
    cnpj: string;
  }, userId: number): Promise<Empresa> {
    try {
      const company = await Empresa.create(data);
      await this.auditService.logAction(
        userId,
        'Empresa',
        company.id,
        'CREATE',
        null,
        data
      );
      return company;
    } catch (error) {
      throw new Error('Erro ao criar empresa');
    }
  }

  public async getCompanyById(id: number): Promise<Empresa | null> {
    try {
      const cacheKey = `company:${id}`;
      const cachedCompany = await this.cacheService.getJson<Empresa>(cacheKey);
      
      if (cachedCompany) {
        return cachedCompany;
      }

      const company = await Empresa.findByPk(id);
      if (company) {
        await this.cacheService.setJson(cacheKey, company, 3600); // Cache por 1 hora
      }
      return company;
    } catch (error) {
      throw new Error('Erro ao buscar empresa');
    }
  }

  public async updateCompany(
    id: number,
    data: {
      name?: string;
      cnpj?: string;
    },
    userId: number
  ): Promise<Empresa | null> {
    try {
      const company = await Empresa.findByPk(id);
      if (!company) {
        return null;
      }

      const oldData = company.toJSON();
      await company.update(data);
      
      await this.auditService.logAction(
        userId,
        'Empresa',
        id,
        'UPDATE',
        oldData,
        data
      );

      const cacheKey = `company:${id}`;
      await this.cacheService.del(cacheKey);

      return company;
    } catch (error) {
      throw new Error('Erro ao atualizar empresa');
    }
  }

  public async deleteCompany(id: number, userId: number): Promise<boolean> {
    try {
      const company = await Empresa.findByPk(id);
      if (!company) {
        return false;
      }

      const oldData = company.toJSON();
      await company.destroy();

      await this.auditService.logAction(
        userId,
        'Empresa',
        id,
        'DELETE',
        oldData,
        null
      );

      const cacheKey = `company:${id}`;
      await this.cacheService.del(cacheKey);

      return true;
    } catch (error) {
      throw new Error('Erro ao deletar empresa');
    }
  }

  public async listCompanies(
    page: number = 1,
    limit: number = 10
  ): Promise<{ companies: Empresa[]; total: number }> {
    try {
      const offset = (page - 1) * limit;
      const { count, rows } = await Empresa.findAndCountAll({
        limit,
        offset,
        order: [['name', 'ASC']],
      });

      return {
        companies: rows,
        total: count,
      };
    } catch (error) {
      throw new Error('Erro ao listar empresas');
    }
  }

  public async getCompanyByCnpj(cnpj: string): Promise<Empresa | null> {
    try {
      const cacheKey = `company:cnpj:${cnpj}`;
      const cachedCompany = await this.cacheService.getJson<Empresa>(cacheKey);
      
      if (cachedCompany) {
        return cachedCompany;
      }

      const company = await Empresa.findOne({ where: { cnpj } });
      if (company) {
        await this.cacheService.setJson(cacheKey, company, 3600); // Cache por 1 hora
      }
      return company;
    } catch (error) {
      throw new Error('Erro ao buscar empresa por CNPJ');
    }
  }
} 