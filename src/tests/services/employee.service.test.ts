import { CacheService } from '../../services/cache.service';
import { Employee } from '../../models/employee.model';
import { EmployeeService } from '../../services/employee.service';
import { Company } from '../../models/company.model';
import { Department } from '../../models/department.model';
import { User } from '../../models/user.model';

jest.mock('../../models/employee.model');
jest.mock('../../models/company.model');
jest.mock('../../models/department.model');
jest.mock('../../models/user.model');
jest.mock('../../services/cache.service');

describe('EmployeeService', () => {
  let employeeService: EmployeeService;
  let cacheService: CacheService;

  const mockEmployee = {
    id: '1',
    userId: 'user-1',
    companyId: 'company-1',
    departmentId: 'department-1',
    registration: 'EMP001',
    position: 'Developer',
    admissionDate: new Date(),
    status: 'ACTIVE',
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
  };

  beforeEach(() => {
    jest.clearAllMocks();
    employeeService = EmployeeService.getInstance();
    cacheService = CacheService.getInstance();
  });

  describe('createEmployee', () => {
    it('should create a new employee', async () => {
      const createData = {
        userId: 'user-1',
        companyId: 'company-1',
        departmentId: 'department-1',
        registration: 'EMP001',
        position: 'Developer',
        admissionDate: new Date(),
      };

      (Employee.create as jest.Mock).mockResolvedValue(mockEmployee);
      (cacheService.del as jest.Mock).mockResolvedValue(true);

      const result = await employeeService.createEmployee(createData);

      expect(Employee.create).toHaveBeenCalledWith(createData);
      expect(cacheService.del).toHaveBeenCalledWith('employee:user-1');
      expect(cacheService.del).toHaveBeenCalledWith('employees:company-1');
      expect(result).toEqual(mockEmployee);
    });

    it('should throw error when creation fails', async () => {
      const createData = {
        userId: 'user-1',
        companyId: 'company-1',
        registration: 'EMP001',
      };

      (Employee.create as jest.Mock).mockRejectedValue(new Error('Creation failed'));

      await expect(employeeService.createEmployee(createData)).rejects.toThrow(
        'Erro ao criar colaborador'
      );
    });
  });

  describe('getEmployee', () => {
    it('should return employee from cache', async () => {
      (cacheService.getJson as jest.Mock).mockResolvedValue(mockEmployee);

      const result = await employeeService.getEmployee('user-1');

      expect(cacheService.getJson).toHaveBeenCalledWith('employee:user-1');
      expect(Employee.findOne).not.toHaveBeenCalled();
      expect(result).toEqual(mockEmployee);
    });

    it('should fetch from database and cache when not in cache', async () => {
      (cacheService.getJson as jest.Mock).mockResolvedValue(null);
      (Employee.findOne as jest.Mock).mockResolvedValue(mockEmployee);
      (cacheService.setJson as jest.Mock).mockResolvedValue(true);

      const result = await employeeService.getEmployee('user-1');

      expect(cacheService.getJson).toHaveBeenCalledWith('employee:user-1');
      expect(Employee.findOne).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        include: expect.any(Array),
      });
      expect(cacheService.setJson).toHaveBeenCalledWith('employee:user-1', mockEmployee, 3600);
      expect(result).toEqual(mockEmployee);
    });

    it('should throw error when fetch fails', async () => {
      (cacheService.getJson as jest.Mock).mockResolvedValue(null);
      (Employee.findOne as jest.Mock).mockRejectedValue(new Error('Fetch failed'));

      await expect(employeeService.getEmployee('user-1')).rejects.toThrow(
        'Erro ao obter colaborador'
      );
    });
  });

  describe('getEmployeesByCompany', () => {
    it('should return employees from cache', async () => {
      (cacheService.getJson as jest.Mock).mockResolvedValue([mockEmployee]);

      const result = await employeeService.getEmployeesByCompany('company-1');

      expect(cacheService.getJson).toHaveBeenCalledWith('employees:company-1');
      expect(Employee.findAll).not.toHaveBeenCalled();
      expect(result).toEqual([mockEmployee]);
    });

    it('should fetch from database and cache when not in cache', async () => {
      (cacheService.getJson as jest.Mock).mockResolvedValue(null);
      (Employee.findAll as jest.Mock).mockResolvedValue([mockEmployee]);
      (cacheService.setJson as jest.Mock).mockResolvedValue(true);

      const result = await employeeService.getEmployeesByCompany('company-1');

      expect(cacheService.getJson).toHaveBeenCalledWith('employees:company-1');
      expect(Employee.findAll).toHaveBeenCalledWith({
        where: { companyId: 'company-1' },
        include: expect.any(Array),
      });
      expect(cacheService.setJson).toHaveBeenCalledWith('employees:company-1', [mockEmployee], 3600);
      expect(result).toEqual([mockEmployee]);
    });

    it('should throw error when fetch fails', async () => {
      (cacheService.getJson as jest.Mock).mockResolvedValue(null);
      (Employee.findAll as jest.Mock).mockRejectedValue(new Error('Fetch failed'));

      await expect(employeeService.getEmployeesByCompany('company-1')).rejects.toThrow(
        'Erro ao obter colaboradores'
      );
    });
  });

  describe('updateEmployee', () => {
    it('should update employee successfully', async () => {
      const updateData = {
        position: 'Senior Developer',
        departmentId: 'department-2',
      };

      (Employee.update as jest.Mock).mockResolvedValue([1, [mockEmployee]]);
      (cacheService.del as jest.Mock).mockResolvedValue(true);

      const result = await employeeService.updateEmployee('user-1', updateData);

      expect(Employee.update).toHaveBeenCalledWith(updateData, {
        where: { userId: 'user-1' },
        returning: true,
      });
      expect(cacheService.del).toHaveBeenCalledWith('employee:user-1');
      expect(cacheService.del).toHaveBeenCalledWith('employees:company-1');
      expect(result).toEqual(mockEmployee);
    });

    it('should return null when no employee is updated', async () => {
      const updateData = {
        position: 'Senior Developer',
      };

      (Employee.update as jest.Mock).mockResolvedValue([0, []]);

      const result = await employeeService.updateEmployee('user-1', updateData);

      expect(result).toBeNull();
    });

    it('should throw error when update fails', async () => {
      const updateData = {
        position: 'Senior Developer',
      };

      (Employee.update as jest.Mock).mockRejectedValue(new Error('Update failed'));

      await expect(employeeService.updateEmployee('user-1', updateData)).rejects.toThrow(
        'Erro ao atualizar colaborador'
      );
    });
  });

  describe('deleteEmployee', () => {
    it('should delete employee successfully', async () => {
      (Employee.destroy as jest.Mock).mockResolvedValue(1);
      (cacheService.del as jest.Mock).mockResolvedValue(true);

      const result = await employeeService.deleteEmployee('user-1');

      expect(Employee.destroy).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
      });
      expect(cacheService.del).toHaveBeenCalledWith('employee:user-1');
      expect(cacheService.del).toHaveBeenCalledWith('employees:company-1');
      expect(result).toBe(true);
    });

    it('should return false when no employee is deleted', async () => {
      (Employee.destroy as jest.Mock).mockResolvedValue(0);

      const result = await employeeService.deleteEmployee('user-1');

      expect(result).toBe(false);
    });

    it('should throw error when deletion fails', async () => {
      (Employee.destroy as jest.Mock).mockRejectedValue(new Error('Deletion failed'));

      await expect(employeeService.deleteEmployee('user-1')).rejects.toThrow(
        'Erro ao remover colaborador'
      );
    });
  });

  describe('getEmployeeByRegistration', () => {
    it('should return employee by registration', async () => {
      (Employee.findOne as jest.Mock).mockResolvedValue(mockEmployee);

      const result = await employeeService.getEmployeeByRegistration('company-1', 'EMP001');

      expect(Employee.findOne).toHaveBeenCalledWith({
        where: { companyId: 'company-1', registration: 'EMP001' },
        include: expect.any(Array),
      });
      expect(result).toEqual(mockEmployee);
    });

    it('should return null when employee is not found', async () => {
      (Employee.findOne as jest.Mock).mockResolvedValue(null);

      const result = await employeeService.getEmployeeByRegistration('company-1', 'EMP001');

      expect(result).toBeNull();
    });

    it('should throw error when fetch fails', async () => {
      (Employee.findOne as jest.Mock).mockRejectedValue(new Error('Fetch failed'));

      await expect(employeeService.getEmployeeByRegistration('company-1', 'EMP001')).rejects.toThrow(
        'Erro ao obter colaborador por matrícula'
      );
    });
  });

  describe('getEmployeesByDepartment', () => {
    it('should return employees by department', async () => {
      (Employee.findAll as jest.Mock).mockResolvedValue([mockEmployee]);

      const result = await employeeService.getEmployeesByDepartment('department-1');

      expect(Employee.findAll).toHaveBeenCalledWith({
        where: { departmentId: 'department-1' },
        include: expect.any(Array),
      });
      expect(result).toEqual([mockEmployee]);
    });

    it('should return empty array when no employees are found', async () => {
      (Employee.findAll as jest.Mock).mockResolvedValue([]);

      const result = await employeeService.getEmployeesByDepartment('department-1');

      expect(result).toEqual([]);
    });

    it('should throw error when fetch fails', async () => {
      (Employee.findAll as jest.Mock).mockRejectedValue(new Error('Fetch failed'));

      await expect(employeeService.getEmployeesByDepartment('department-1')).rejects.toThrow(
        'Erro ao obter colaboradores do departamento'
      );
    });
  });
}); 