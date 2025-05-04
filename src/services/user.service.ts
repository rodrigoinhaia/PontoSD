import { Usuario } from '../models/usuario.model';
import { CacheService } from './cache.service';
import { AuditService } from './audit.service';
import bcrypt from 'bcrypt';

export class UserService {
  private static instance: UserService;
  private cacheService: CacheService;
  private auditService: AuditService;

  private constructor() {
    this.cacheService = CacheService.getInstance();
    this.auditService = AuditService.getInstance();
  }

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  public async createUser(data: {
    name: string;
    email: string;
    password: string;
    role: string;
    companyId: number;
    departmentId?: number;
  }, userId: number): Promise<Usuario> {
    try {
      const hashedPassword = await bcrypt.hash(data.password, 10);
      const user = await Usuario.create({
        ...data,
        password: hashedPassword,
      });
      
      await this.auditService.logAction(
        userId,
        'Usuario',
        user.id,
        'CREATE',
        null,
        { ...data, password: '[REDACTED]' }
      );
      return user;
    } catch (error) {
      throw new Error('Erro ao criar usuário');
    }
  }

  public async getUserById(id: number): Promise<Usuario | null> {
    try {
      const cacheKey = `user:${id}`;
      const cachedUser = await this.cacheService.getJson<Usuario>(cacheKey);
      
      if (cachedUser) {
        return cachedUser;
      }

      const user = await Usuario.findByPk(id);
      if (user) {
        await this.cacheService.setJson(cacheKey, user, 3600); // Cache por 1 hora
      }
      return user;
    } catch (error) {
      throw new Error('Erro ao buscar usuário');
    }
  }

  public async updateUser(
    id: number,
    data: {
      name?: string;
      email?: string;
      password?: string;
      role?: string;
      companyId?: number;
      departmentId?: number;
    },
    userId: number
  ): Promise<Usuario | null> {
    try {
      const user = await Usuario.findByPk(id);
      if (!user) {
        return null;
      }

      const oldData = user.toJSON();
      
      if (data.password) {
        data.password = await bcrypt.hash(data.password, 10);
      }

      await user.update(data);
      
      await this.auditService.logAction(
        userId,
        'Usuario',
        id,
        'UPDATE',
        { ...oldData, password: '[REDACTED]' },
        { ...data, password: data.password ? '[REDACTED]' : undefined }
      );

      const cacheKey = `user:${id}`;
      await this.cacheService.del(cacheKey);

      return user;
    } catch (error) {
      throw new Error('Erro ao atualizar usuário');
    }
  }

  public async deleteUser(id: number, userId: number): Promise<boolean> {
    try {
      const user = await Usuario.findByPk(id);
      if (!user) {
        return false;
      }

      const oldData = user.toJSON();
      await user.destroy();

      await this.auditService.logAction(
        userId,
        'Usuario',
        id,
        'DELETE',
        { ...oldData, password: '[REDACTED]' },
        null
      );

      const cacheKey = `user:${id}`;
      await this.cacheService.del(cacheKey);

      return true;
    } catch (error) {
      throw new Error('Erro ao deletar usuário');
    }
  }

  public async listUsers(
    companyId: number,
    departmentId?: number,
    page: number = 1,
    limit: number = 10
  ): Promise<{ users: Usuario[]; total: number }> {
    try {
      const offset = (page - 1) * limit;
      const where: any = { companyId };
      
      if (departmentId) {
        where.departmentId = departmentId;
      }

      const { count, rows } = await Usuario.findAndCountAll({
        where,
        limit,
        offset,
        order: [['name', 'ASC']],
      });

      return {
        users: rows,
        total: count,
      };
    } catch (error) {
      throw new Error('Erro ao listar usuários');
    }
  }

  public async getUserByEmail(email: string): Promise<Usuario | null> {
    try {
      const cacheKey = `user:email:${email}`;
      const cachedUser = await this.cacheService.getJson<Usuario>(cacheKey);
      
      if (cachedUser) {
        return cachedUser;
      }

      const user = await Usuario.findOne({
        where: { email }
      });
      
      if (user) {
        await this.cacheService.setJson(cacheKey, user, 3600); // Cache por 1 hora
      }
      return user;
    } catch (error) {
      throw new Error('Erro ao buscar usuário por email');
    }
  }

  public async validatePassword(user: Usuario, password: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, user.password);
    } catch (error) {
      throw new Error('Erro ao validar senha');
    }
  }
} 