import bcrypt from 'bcrypt';

import { AuditService } from '../../services/audit.service';
import { CacheService } from '../../services/cache.service';
import { Usuario } from '../../models/usuario.model';
import { UserService } from '../../services/user.service';

jest.mock('../../models/usuario.model');
jest.mock('../../services/cache.service');
jest.mock('../../services/audit.service');
jest.mock('bcrypt');

describe('UserService', () => {
  let userService: UserService;
  let cacheService: jest.Mocked<CacheService>;
  let auditService: jest.Mocked<AuditService>;

  beforeEach(() => {
    jest.clearAllMocks();
    userService = UserService.getInstance();
    cacheService = CacheService.getInstance() as jest.Mocked<CacheService>;
    auditService = AuditService.getInstance() as jest.Mocked<AuditService>;
  });

  describe('createUser', () => {
    it('should create a user successfully', async () => {
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedPassword',
        role: 'user',
        companyId: 1,
        departmentId: 1,
      };

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      (Usuario.create as jest.Mock).mockResolvedValue(mockUser);
      (auditService.logAction as jest.Mock).mockResolvedValue(undefined);

      const result = await userService.createUser(
        {
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          role: 'user',
          companyId: 1,
          departmentId: 1,
        },
        1
      );

      expect(result).toEqual(mockUser);
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(Usuario.create).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedPassword',
        role: 'user',
        companyId: 1,
        departmentId: 1,
      });
      expect(auditService.logAction).toHaveBeenCalledWith(
        1,
        'Usuario',
        1,
        'CREATE',
        null,
        {
          name: 'Test User',
          email: 'test@example.com',
          password: '[REDACTED]',
          role: 'user',
          companyId: 1,
          departmentId: 1,
        }
      );
    });

    it('should throw an error when creation fails', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      (Usuario.create as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(
        userService.createUser(
          {
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123',
            role: 'user',
            companyId: 1,
            departmentId: 1,
          },
          1
        )
      ).rejects.toThrow('Erro ao criar usuário');
    });
  });

  describe('getUserById', () => {
    it('should return user from cache if available', async () => {
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedPassword',
        role: 'user',
        companyId: 1,
        departmentId: 1,
      };

      (cacheService.getJson as jest.Mock).mockResolvedValue(mockUser);

      const result = await userService.getUserById(1);

      expect(result).toEqual(mockUser);
      expect(cacheService.getJson).toHaveBeenCalledWith('user:1');
      expect(Usuario.findByPk).not.toHaveBeenCalled();
    });

    it('should fetch user from database and cache it if not in cache', async () => {
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedPassword',
        role: 'user',
        companyId: 1,
        departmentId: 1,
      };

      (cacheService.getJson as jest.Mock).mockResolvedValue(null);
      (Usuario.findByPk as jest.Mock).mockResolvedValue(mockUser);
      (cacheService.setJson as jest.Mock).mockResolvedValue(undefined);

      const result = await userService.getUserById(1);

      expect(result).toEqual(mockUser);
      expect(cacheService.getJson).toHaveBeenCalledWith('user:1');
      expect(Usuario.findByPk).toHaveBeenCalledWith(1);
      expect(cacheService.setJson).toHaveBeenCalledWith(
        'user:1',
        mockUser,
        3600
      );
    });

    it('should throw an error when fetching fails', async () => {
      (cacheService.getJson as jest.Mock).mockResolvedValue(null);
      (Usuario.findByPk as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(userService.getUserById(1)).rejects.toThrow(
        'Erro ao buscar usuário'
      );
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedPassword',
        role: 'user',
        companyId: 1,
        departmentId: 1,
        update: jest.fn().mockResolvedValue(undefined),
        toJSON: jest.fn().mockReturnValue({
          id: 1,
          name: 'Old User',
          email: 'old@example.com',
          password: 'oldHashedPassword',
          role: 'user',
          companyId: 1,
          departmentId: 1,
        }),
      };

      (Usuario.findByPk as jest.Mock).mockResolvedValue(mockUser);
      (auditService.logAction as jest.Mock).mockResolvedValue(undefined);
      (cacheService.del as jest.Mock).mockResolvedValue(undefined);

      const result = await userService.updateUser(
        1,
        {
          name: 'Updated User',
          email: 'updated@example.com',
        },
        1
      );

      expect(result).toEqual(mockUser);
      expect(mockUser.update).toHaveBeenCalledWith({
        name: 'Updated User',
        email: 'updated@example.com',
      });
      expect(auditService.logAction).toHaveBeenCalledWith(
        1,
        'Usuario',
        1,
        'UPDATE',
        {
          id: 1,
          name: 'Old User',
          email: 'old@example.com',
          password: '[REDACTED]',
          role: 'user',
          companyId: 1,
          departmentId: 1,
        },
        {
          name: 'Updated User',
          email: 'updated@example.com',
        }
      );
      expect(cacheService.del).toHaveBeenCalledWith('user:1');
    });

    it('should update password if provided', async () => {
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedPassword',
        role: 'user',
        companyId: 1,
        departmentId: 1,
        update: jest.fn().mockResolvedValue(undefined),
        toJSON: jest.fn().mockReturnValue({
          id: 1,
          name: 'Old User',
          email: 'old@example.com',
          password: 'oldHashedPassword',
          role: 'user',
          companyId: 1,
          departmentId: 1,
        }),
      };

      (Usuario.findByPk as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('newHashedPassword');
      (auditService.logAction as jest.Mock).mockResolvedValue(undefined);
      (cacheService.del as jest.Mock).mockResolvedValue(undefined);

      const result = await userService.updateUser(
        1,
        {
          password: 'newPassword',
        },
        1
      );

      expect(result).toEqual(mockUser);
      expect(bcrypt.hash).toHaveBeenCalledWith('newPassword', 10);
      expect(mockUser.update).toHaveBeenCalledWith({
        password: 'newHashedPassword',
      });
      expect(auditService.logAction).toHaveBeenCalledWith(
        1,
        'Usuario',
        1,
        'UPDATE',
        {
          id: 1,
          name: 'Old User',
          email: 'old@example.com',
          password: '[REDACTED]',
          role: 'user',
          companyId: 1,
          departmentId: 1,
        },
        {
          password: '[REDACTED]',
        }
      );
    });

    it('should return null if user not found', async () => {
      (Usuario.findByPk as jest.Mock).mockResolvedValue(null);

      const result = await userService.updateUser(
        1,
        {
          name: 'Updated User',
        },
        1
      );

      expect(result).toBeNull();
    });

    it('should throw an error when update fails', async () => {
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedPassword',
        role: 'user',
        companyId: 1,
        departmentId: 1,
        update: jest.fn().mockRejectedValue(new Error('Database error')),
        toJSON: jest.fn().mockReturnValue({
          id: 1,
          name: 'Old User',
          email: 'old@example.com',
          password: 'oldHashedPassword',
          role: 'user',
          companyId: 1,
          departmentId: 1,
        }),
      };

      (Usuario.findByPk as jest.Mock).mockResolvedValue(mockUser);

      await expect(
        userService.updateUser(
          1,
          {
            name: 'Updated User',
          },
          1
        )
      ).rejects.toThrow('Erro ao atualizar usuário');
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedPassword',
        role: 'user',
        companyId: 1,
        departmentId: 1,
        destroy: jest.fn().mockResolvedValue(undefined),
        toJSON: jest.fn().mockReturnValue({
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
          password: 'hashedPassword',
          role: 'user',
          companyId: 1,
          departmentId: 1,
        }),
      };

      (Usuario.findByPk as jest.Mock).mockResolvedValue(mockUser);
      (auditService.logAction as jest.Mock).mockResolvedValue(undefined);
      (cacheService.del as jest.Mock).mockResolvedValue(undefined);

      const result = await userService.deleteUser(1, 1);

      expect(result).toBe(true);
      expect(mockUser.destroy).toHaveBeenCalled();
      expect(auditService.logAction).toHaveBeenCalledWith(
        1,
        'Usuario',
        1,
        'DELETE',
        {
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
          password: '[REDACTED]',
          role: 'user',
          companyId: 1,
          departmentId: 1,
        },
        null
      );
      expect(cacheService.del).toHaveBeenCalledWith('user:1');
    });

    it('should return false if user not found', async () => {
      (Usuario.findByPk as jest.Mock).mockResolvedValue(null);

      const result = await userService.deleteUser(1, 1);

      expect(result).toBe(false);
    });

    it('should throw an error when deletion fails', async () => {
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedPassword',
        role: 'user',
        companyId: 1,
        departmentId: 1,
        destroy: jest.fn().mockRejectedValue(new Error('Database error')),
        toJSON: jest.fn().mockReturnValue({
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
          password: 'hashedPassword',
          role: 'user',
          companyId: 1,
          departmentId: 1,
        }),
      };

      (Usuario.findByPk as jest.Mock).mockResolvedValue(mockUser);

      await expect(userService.deleteUser(1, 1)).rejects.toThrow(
        'Erro ao deletar usuário'
      );
    });
  });

  describe('listUsers', () => {
    it('should list users successfully', async () => {
      const mockUsers = [
        {
          id: 1,
          name: 'User 1',
          email: 'user1@example.com',
          password: 'hashedPassword1',
          role: 'user',
          companyId: 1,
          departmentId: 1,
        },
        {
          id: 2,
          name: 'User 2',
          email: 'user2@example.com',
          password: 'hashedPassword2',
          role: 'user',
          companyId: 1,
          departmentId: 1,
        },
      ];

      (Usuario.findAndCountAll as jest.Mock).mockResolvedValue({
        count: 2,
        rows: mockUsers,
      });

      const result = await userService.listUsers(1, 1, 1, 10);

      expect(result).toEqual({
        users: mockUsers,
        total: 2,
      });
      expect(Usuario.findAndCountAll).toHaveBeenCalledWith({
        where: { companyId: 1, departmentId: 1 },
        limit: 10,
        offset: 0,
        order: [['name', 'ASC']],
      });
    });

    it('should throw an error when listing fails', async () => {
      (Usuario.findAndCountAll as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await expect(userService.listUsers(1, 1, 1, 10)).rejects.toThrow(
        'Erro ao listar usuários'
      );
    });
  });

  describe('getUserByEmail', () => {
    it('should return user from cache if available', async () => {
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedPassword',
        role: 'user',
        companyId: 1,
        departmentId: 1,
      };

      (cacheService.getJson as jest.Mock).mockResolvedValue(mockUser);

      const result = await userService.getUserByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(cacheService.getJson).toHaveBeenCalledWith('user:email:test@example.com');
      expect(Usuario.findOne).not.toHaveBeenCalled();
    });

    it('should fetch user from database and cache it if not in cache', async () => {
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedPassword',
        role: 'user',
        companyId: 1,
        departmentId: 1,
      };

      (cacheService.getJson as jest.Mock).mockResolvedValue(null);
      (Usuario.findOne as jest.Mock).mockResolvedValue(mockUser);
      (cacheService.setJson as jest.Mock).mockResolvedValue(undefined);

      const result = await userService.getUserByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(cacheService.getJson).toHaveBeenCalledWith('user:email:test@example.com');
      expect(Usuario.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(cacheService.setJson).toHaveBeenCalledWith(
        'user:email:test@example.com',
        mockUser,
        3600
      );
    });

    it('should throw an error when fetching fails', async () => {
      (cacheService.getJson as jest.Mock).mockResolvedValue(null);
      (Usuario.findOne as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(
        userService.getUserByEmail('test@example.com')
      ).rejects.toThrow('Erro ao buscar usuário por email');
    });
  });

  describe('validatePassword', () => {
    it('should validate password successfully', async () => {
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedPassword',
        role: 'user',
        companyId: 1,
        departmentId: 1,
      };

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await userService.validatePassword(mockUser, 'password123');

      expect(result).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
    });

    it('should return false for invalid password', async () => {
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedPassword',
        role: 'user',
        companyId: 1,
        departmentId: 1,
      };

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await userService.validatePassword(mockUser, 'wrongPassword');

      expect(result).toBe(false);
      expect(bcrypt.compare).toHaveBeenCalledWith('wrongPassword', 'hashedPassword');
    });

    it('should throw an error when validation fails', async () => {
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedPassword',
        role: 'user',
        companyId: 1,
        departmentId: 1,
      };

      (bcrypt.compare as jest.Mock).mockRejectedValue(new Error('Hash error'));

      await expect(
        userService.validatePassword(mockUser, 'password123')
      ).rejects.toThrow('Erro ao validar senha');
    });
  });
}); 