import { DepartmentService } from '../../services/department.service';
import { Departamento } from '../../models/departamento.model';
import { CacheService } from '../../services/cache.service';
import { AuditService } from '../../services/audit.service';

jest.mock('../../models/departamento.model');
jest.mock('../../services/cache.service');
jest.mock('../../services/audit.service');

describe('DepartmentService', () => {
  let departmentService: DepartmentService;
  let cacheService: jest.Mocked<CacheService>;
  let auditService: jest.Mocked<AuditService>;

  beforeEach(() => {
    jest.clearAllMocks();
    departmentService = DepartmentService.getInstance();
    cacheService = CacheService.getInstance() as jest.Mocked<CacheService>;
    auditService = AuditService.getInstance() as jest.Mocked<AuditService>;
  });

  describe('createDepartment', () => {
    it('should create a department successfully', async () => {
      const mockDepartment = {
        id: 1,
        name: 'Test Department',
        companyId: 1,
      };

      (Departamento.create as jest.Mock).mockResolvedValue(mockDepartment);
      (auditService.logAction as jest.Mock).mockResolvedValue(undefined);

      const result = await departmentService.createDepartment(
        {
          name: 'Test Department',
          companyId: 1,
        },
        1
      );

      expect(result).toEqual(mockDepartment);
      expect(Departamento.create).toHaveBeenCalledWith({
        name: 'Test Department',
        companyId: 1,
      });
      expect(auditService.logAction).toHaveBeenCalledWith(
        1,
        'Departamento',
        1,
        'CREATE',
        null,
        {
          name: 'Test Department',
          companyId: 1,
        }
      );
    });

    it('should throw an error when creation fails', async () => {
      (Departamento.create as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(
        departmentService.createDepartment(
          {
            name: 'Test Department',
            companyId: 1,
          },
          1
        )
      ).rejects.toThrow('Erro ao criar departamento');
    });
  });

  describe('getDepartmentById', () => {
    it('should return department from cache if available', async () => {
      const mockDepartment = {
        id: 1,
        name: 'Test Department',
        companyId: 1,
      };

      (cacheService.getJson as jest.Mock).mockResolvedValue(mockDepartment);

      const result = await departmentService.getDepartmentById(1);

      expect(result).toEqual(mockDepartment);
      expect(cacheService.getJson).toHaveBeenCalledWith('department:1');
      expect(Departamento.findByPk).not.toHaveBeenCalled();
    });

    it('should fetch department from database and cache it if not in cache', async () => {
      const mockDepartment = {
        id: 1,
        name: 'Test Department',
        companyId: 1,
      };

      (cacheService.getJson as jest.Mock).mockResolvedValue(null);
      (Departamento.findByPk as jest.Mock).mockResolvedValue(mockDepartment);
      (cacheService.setJson as jest.Mock).mockResolvedValue(undefined);

      const result = await departmentService.getDepartmentById(1);

      expect(result).toEqual(mockDepartment);
      expect(cacheService.getJson).toHaveBeenCalledWith('department:1');
      expect(Departamento.findByPk).toHaveBeenCalledWith(1);
      expect(cacheService.setJson).toHaveBeenCalledWith(
        'department:1',
        mockDepartment,
        3600
      );
    });

    it('should throw an error when fetching fails', async () => {
      (cacheService.getJson as jest.Mock).mockResolvedValue(null);
      (Departamento.findByPk as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(departmentService.getDepartmentById(1)).rejects.toThrow(
        'Erro ao buscar departamento'
      );
    });
  });

  describe('updateDepartment', () => {
    it('should update department successfully', async () => {
      const mockDepartment = {
        id: 1,
        name: 'Test Department',
        companyId: 1,
        update: jest.fn().mockResolvedValue(undefined),
        toJSON: jest.fn().mockReturnValue({
          id: 1,
          name: 'Old Department',
          companyId: 1,
        }),
      };

      (Departamento.findByPk as jest.Mock).mockResolvedValue(mockDepartment);
      (auditService.logAction as jest.Mock).mockResolvedValue(undefined);
      (cacheService.del as jest.Mock).mockResolvedValue(undefined);

      const result = await departmentService.updateDepartment(
        1,
        {
          name: 'Updated Department',
        },
        1
      );

      expect(result).toEqual(mockDepartment);
      expect(mockDepartment.update).toHaveBeenCalledWith({
        name: 'Updated Department',
      });
      expect(auditService.logAction).toHaveBeenCalledWith(
        1,
        'Departamento',
        1,
        'UPDATE',
        {
          id: 1,
          name: 'Old Department',
          companyId: 1,
        },
        {
          name: 'Updated Department',
        }
      );
      expect(cacheService.del).toHaveBeenCalledWith('department:1');
    });

    it('should return null if department not found', async () => {
      (Departamento.findByPk as jest.Mock).mockResolvedValue(null);

      const result = await departmentService.updateDepartment(
        1,
        {
          name: 'Updated Department',
        },
        1
      );

      expect(result).toBeNull();
    });

    it('should throw an error when update fails', async () => {
      const mockDepartment = {
        id: 1,
        name: 'Test Department',
        companyId: 1,
        update: jest.fn().mockRejectedValue(new Error('Database error')),
        toJSON: jest.fn().mockReturnValue({
          id: 1,
          name: 'Old Department',
          companyId: 1,
        }),
      };

      (Departamento.findByPk as jest.Mock).mockResolvedValue(mockDepartment);

      await expect(
        departmentService.updateDepartment(
          1,
          {
            name: 'Updated Department',
          },
          1
        )
      ).rejects.toThrow('Erro ao atualizar departamento');
    });
  });

  describe('deleteDepartment', () => {
    it('should delete department successfully', async () => {
      const mockDepartment = {
        id: 1,
        name: 'Test Department',
        companyId: 1,
        destroy: jest.fn().mockResolvedValue(undefined),
        toJSON: jest.fn().mockReturnValue({
          id: 1,
          name: 'Test Department',
          companyId: 1,
        }),
      };

      (Departamento.findByPk as jest.Mock).mockResolvedValue(mockDepartment);
      (auditService.logAction as jest.Mock).mockResolvedValue(undefined);
      (cacheService.del as jest.Mock).mockResolvedValue(undefined);

      const result = await departmentService.deleteDepartment(1, 1);

      expect(result).toBe(true);
      expect(mockDepartment.destroy).toHaveBeenCalled();
      expect(auditService.logAction).toHaveBeenCalledWith(
        1,
        'Departamento',
        1,
        'DELETE',
        {
          id: 1,
          name: 'Test Department',
          companyId: 1,
        },
        null
      );
      expect(cacheService.del).toHaveBeenCalledWith('department:1');
    });

    it('should return false if department not found', async () => {
      (Departamento.findByPk as jest.Mock).mockResolvedValue(null);

      const result = await departmentService.deleteDepartment(1, 1);

      expect(result).toBe(false);
    });

    it('should throw an error when deletion fails', async () => {
      const mockDepartment = {
        id: 1,
        name: 'Test Department',
        companyId: 1,
        destroy: jest.fn().mockRejectedValue(new Error('Database error')),
        toJSON: jest.fn().mockReturnValue({
          id: 1,
          name: 'Test Department',
          companyId: 1,
        }),
      };

      (Departamento.findByPk as jest.Mock).mockResolvedValue(mockDepartment);

      await expect(departmentService.deleteDepartment(1, 1)).rejects.toThrow(
        'Erro ao deletar departamento'
      );
    });
  });

  describe('listDepartments', () => {
    it('should list departments successfully', async () => {
      const mockDepartments = [
        {
          id: 1,
          name: 'Department 1',
          companyId: 1,
        },
        {
          id: 2,
          name: 'Department 2',
          companyId: 1,
        },
      ];

      (Departamento.findAndCountAll as jest.Mock).mockResolvedValue({
        count: 2,
        rows: mockDepartments,
      });

      const result = await departmentService.listDepartments(1, 1, 10);

      expect(result).toEqual({
        departments: mockDepartments,
        total: 2,
      });
      expect(Departamento.findAndCountAll).toHaveBeenCalledWith({
        where: { companyId: 1 },
        limit: 10,
        offset: 0,
        order: [['name', 'ASC']],
      });
    });

    it('should throw an error when listing fails', async () => {
      (Departamento.findAndCountAll as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await expect(departmentService.listDepartments(1, 1, 10)).rejects.toThrow(
        'Erro ao listar departamentos'
      );
    });
  });

  describe('getDepartmentByNameAndCompany', () => {
    it('should return department from cache if available', async () => {
      const mockDepartment = {
        id: 1,
        name: 'Test Department',
        companyId: 1,
      };

      (cacheService.getJson as jest.Mock).mockResolvedValue(mockDepartment);

      const result = await departmentService.getDepartmentByNameAndCompany(
        'Test Department',
        1
      );

      expect(result).toEqual(mockDepartment);
      expect(cacheService.getJson).toHaveBeenCalledWith('department:1:Test Department');
      expect(Departamento.findOne).not.toHaveBeenCalled();
    });

    it('should fetch department from database and cache it if not in cache', async () => {
      const mockDepartment = {
        id: 1,
        name: 'Test Department',
        companyId: 1,
      };

      (cacheService.getJson as jest.Mock).mockResolvedValue(null);
      (Departamento.findOne as jest.Mock).mockResolvedValue(mockDepartment);
      (cacheService.setJson as jest.Mock).mockResolvedValue(undefined);

      const result = await departmentService.getDepartmentByNameAndCompany(
        'Test Department',
        1
      );

      expect(result).toEqual(mockDepartment);
      expect(cacheService.getJson).toHaveBeenCalledWith('department:1:Test Department');
      expect(Departamento.findOne).toHaveBeenCalledWith({
        where: { name: 'Test Department', companyId: 1 },
      });
      expect(cacheService.setJson).toHaveBeenCalledWith(
        'department:1:Test Department',
        mockDepartment,
        3600
      );
    });

    it('should throw an error when fetching fails', async () => {
      (cacheService.getJson as jest.Mock).mockResolvedValue(null);
      (Departamento.findOne as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(
        departmentService.getDepartmentByNameAndCompany('Test Department', 1)
      ).rejects.toThrow('Erro ao buscar departamento por nome e empresa');
    });
  });
}); 