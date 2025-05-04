import { CompanyService } from '../../services/company.service';
import { Empresa } from '../../models/empresa.model';
import { CacheService } from '../../services/cache.service';
import { AuditService } from '../../services/audit.service';

jest.mock('../../models/empresa.model');
jest.mock('../../services/cache.service');
jest.mock('../../services/audit.service');

describe('CompanyService', () => {
  let companyService: CompanyService;
  let cacheService: jest.Mocked<CacheService>;
  let auditService: jest.Mocked<AuditService>;

  beforeEach(() => {
    jest.clearAllMocks();
    companyService = CompanyService.getInstance();
    cacheService = CacheService.getInstance() as jest.Mocked<CacheService>;
    auditService = AuditService.getInstance() as jest.Mocked<AuditService>;
  });

  describe('createCompany', () => {
    it('should create a company successfully', async () => {
      const mockCompany = {
        id: 1,
        name: 'Test Company',
        cnpj: '12345678901234',
      };

      (Empresa.create as jest.Mock).mockResolvedValue(mockCompany);
      (auditService.logAction as jest.Mock).mockResolvedValue(undefined);

      const result = await companyService.createCompany(
        {
          name: 'Test Company',
          cnpj: '12345678901234',
        },
        1
      );

      expect(result).toEqual(mockCompany);
      expect(Empresa.create).toHaveBeenCalledWith({
        name: 'Test Company',
        cnpj: '12345678901234',
      });
      expect(auditService.logAction).toHaveBeenCalledWith(
        1,
        'Empresa',
        1,
        'CREATE',
        null,
        {
          name: 'Test Company',
          cnpj: '12345678901234',
        }
      );
    });

    it('should throw an error when creation fails', async () => {
      (Empresa.create as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(
        companyService.createCompany(
          {
            name: 'Test Company',
            cnpj: '12345678901234',
          },
          1
        )
      ).rejects.toThrow('Erro ao criar empresa');
    });
  });

  describe('getCompanyById', () => {
    it('should return company from cache if available', async () => {
      const mockCompany = {
        id: 1,
        name: 'Test Company',
        cnpj: '12345678901234',
      };

      (cacheService.getJson as jest.Mock).mockResolvedValue(mockCompany);

      const result = await companyService.getCompanyById(1);

      expect(result).toEqual(mockCompany);
      expect(cacheService.getJson).toHaveBeenCalledWith('company:1');
      expect(Empresa.findByPk).not.toHaveBeenCalled();
    });

    it('should fetch company from database and cache it if not in cache', async () => {
      const mockCompany = {
        id: 1,
        name: 'Test Company',
        cnpj: '12345678901234',
      };

      (cacheService.getJson as jest.Mock).mockResolvedValue(null);
      (Empresa.findByPk as jest.Mock).mockResolvedValue(mockCompany);
      (cacheService.setJson as jest.Mock).mockResolvedValue(undefined);

      const result = await companyService.getCompanyById(1);

      expect(result).toEqual(mockCompany);
      expect(cacheService.getJson).toHaveBeenCalledWith('company:1');
      expect(Empresa.findByPk).toHaveBeenCalledWith(1);
      expect(cacheService.setJson).toHaveBeenCalledWith(
        'company:1',
        mockCompany,
        3600
      );
    });

    it('should throw an error when fetching fails', async () => {
      (cacheService.getJson as jest.Mock).mockResolvedValue(null);
      (Empresa.findByPk as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(companyService.getCompanyById(1)).rejects.toThrow(
        'Erro ao buscar empresa'
      );
    });
  });

  describe('updateCompany', () => {
    it('should update company successfully', async () => {
      const mockCompany = {
        id: 1,
        name: 'Test Company',
        cnpj: '12345678901234',
        update: jest.fn().mockResolvedValue(undefined),
        toJSON: jest.fn().mockReturnValue({
          id: 1,
          name: 'Old Company',
          cnpj: '12345678901234',
        }),
      };

      (Empresa.findByPk as jest.Mock).mockResolvedValue(mockCompany);
      (auditService.logAction as jest.Mock).mockResolvedValue(undefined);
      (cacheService.del as jest.Mock).mockResolvedValue(undefined);

      const result = await companyService.updateCompany(
        1,
        {
          name: 'Updated Company',
        },
        1
      );

      expect(result).toEqual(mockCompany);
      expect(mockCompany.update).toHaveBeenCalledWith({
        name: 'Updated Company',
      });
      expect(auditService.logAction).toHaveBeenCalledWith(
        1,
        'Empresa',
        1,
        'UPDATE',
        {
          id: 1,
          name: 'Old Company',
          cnpj: '12345678901234',
        },
        {
          name: 'Updated Company',
        }
      );
      expect(cacheService.del).toHaveBeenCalledWith('company:1');
    });

    it('should return null if company not found', async () => {
      (Empresa.findByPk as jest.Mock).mockResolvedValue(null);

      const result = await companyService.updateCompany(
        1,
        {
          name: 'Updated Company',
        },
        1
      );

      expect(result).toBeNull();
    });

    it('should throw an error when update fails', async () => {
      const mockCompany = {
        id: 1,
        name: 'Test Company',
        cnpj: '12345678901234',
        update: jest.fn().mockRejectedValue(new Error('Database error')),
        toJSON: jest.fn().mockReturnValue({
          id: 1,
          name: 'Old Company',
          cnpj: '12345678901234',
        }),
      };

      (Empresa.findByPk as jest.Mock).mockResolvedValue(mockCompany);

      await expect(
        companyService.updateCompany(
          1,
          {
            name: 'Updated Company',
          },
          1
        )
      ).rejects.toThrow('Erro ao atualizar empresa');
    });
  });

  describe('deleteCompany', () => {
    it('should delete company successfully', async () => {
      const mockCompany = {
        id: 1,
        name: 'Test Company',
        cnpj: '12345678901234',
        destroy: jest.fn().mockResolvedValue(undefined),
        toJSON: jest.fn().mockReturnValue({
          id: 1,
          name: 'Test Company',
          cnpj: '12345678901234',
        }),
      };

      (Empresa.findByPk as jest.Mock).mockResolvedValue(mockCompany);
      (auditService.logAction as jest.Mock).mockResolvedValue(undefined);
      (cacheService.del as jest.Mock).mockResolvedValue(undefined);

      const result = await companyService.deleteCompany(1, 1);

      expect(result).toBe(true);
      expect(mockCompany.destroy).toHaveBeenCalled();
      expect(auditService.logAction).toHaveBeenCalledWith(
        1,
        'Empresa',
        1,
        'DELETE',
        {
          id: 1,
          name: 'Test Company',
          cnpj: '12345678901234',
        },
        null
      );
      expect(cacheService.del).toHaveBeenCalledWith('company:1');
    });

    it('should return false if company not found', async () => {
      (Empresa.findByPk as jest.Mock).mockResolvedValue(null);

      const result = await companyService.deleteCompany(1, 1);

      expect(result).toBe(false);
    });

    it('should throw an error when deletion fails', async () => {
      const mockCompany = {
        id: 1,
        name: 'Test Company',
        cnpj: '12345678901234',
        destroy: jest.fn().mockRejectedValue(new Error('Database error')),
        toJSON: jest.fn().mockReturnValue({
          id: 1,
          name: 'Test Company',
          cnpj: '12345678901234',
        }),
      };

      (Empresa.findByPk as jest.Mock).mockResolvedValue(mockCompany);

      await expect(companyService.deleteCompany(1, 1)).rejects.toThrow(
        'Erro ao deletar empresa'
      );
    });
  });

  describe('listCompanies', () => {
    it('should list companies successfully', async () => {
      const mockCompanies = [
        {
          id: 1,
          name: 'Company 1',
          cnpj: '12345678901234',
        },
        {
          id: 2,
          name: 'Company 2',
          cnpj: '56789012345678',
        },
      ];

      (Empresa.findAndCountAll as jest.Mock).mockResolvedValue({
        count: 2,
        rows: mockCompanies,
      });

      const result = await companyService.listCompanies(1, 10);

      expect(result).toEqual({
        companies: mockCompanies,
        total: 2,
      });
      expect(Empresa.findAndCountAll).toHaveBeenCalledWith({
        limit: 10,
        offset: 0,
        order: [['name', 'ASC']],
      });
    });

    it('should throw an error when listing fails', async () => {
      (Empresa.findAndCountAll as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await expect(companyService.listCompanies(1, 10)).rejects.toThrow(
        'Erro ao listar empresas'
      );
    });
  });

  describe('getCompanyByCnpj', () => {
    it('should return company from cache if available', async () => {
      const mockCompany = {
        id: 1,
        name: 'Test Company',
        cnpj: '12345678901234',
      };

      (cacheService.getJson as jest.Mock).mockResolvedValue(mockCompany);

      const result = await companyService.getCompanyByCnpj('12345678901234');

      expect(result).toEqual(mockCompany);
      expect(cacheService.getJson).toHaveBeenCalledWith(
        'company:cnpj:12345678901234'
      );
      expect(Empresa.findOne).not.toHaveBeenCalled();
    });

    it('should fetch company from database and cache it if not in cache', async () => {
      const mockCompany = {
        id: 1,
        name: 'Test Company',
        cnpj: '12345678901234',
      };

      (cacheService.getJson as jest.Mock).mockResolvedValue(null);
      (Empresa.findOne as jest.Mock).mockResolvedValue(mockCompany);
      (cacheService.setJson as jest.Mock).mockResolvedValue(undefined);

      const result = await companyService.getCompanyByCnpj('12345678901234');

      expect(result).toEqual(mockCompany);
      expect(cacheService.getJson).toHaveBeenCalledWith(
        'company:cnpj:12345678901234'
      );
      expect(Empresa.findOne).toHaveBeenCalledWith({
        where: { cnpj: '12345678901234' },
      });
      expect(cacheService.setJson).toHaveBeenCalledWith(
        'company:cnpj:12345678901234',
        mockCompany,
        3600
      );
    });

    it('should throw an error when fetching fails', async () => {
      (cacheService.getJson as jest.Mock).mockResolvedValue(null);
      (Empresa.findOne as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(
        companyService.getCompanyByCnpj('12345678901234')
      ).rejects.toThrow('Erro ao buscar empresa por CNPJ');
    });
  });
}); 