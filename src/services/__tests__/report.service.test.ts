import { ReportService } from '../report.service';
import { User } from '../../models/user.model';
import { RegistroPonto } from '../../models/registroPonto.model';
import { Relatorio } from '../../models/relatorio.model';

jest.mock('../../models/user.model');
jest.mock('../../models/registroPonto.model');
jest.mock('../../models/relatorio.model');

describe('ReportService', () => {
  let service: ReportService;

  beforeEach(() => {
    service = ReportService.getInstance();
    jest.clearAllMocks();
  });

  describe('generatePointReport', () => {
    it('should generate point report successfully', async () => {
      const mockUser = { id: 1 };
      const mockRegistros = [
        { id: 1, userId: 1, data: new Date('2024-01-01T08:00:00'), tipo: 'ENTRADA' },
        { id: 2, userId: 1, data: new Date('2024-01-01T12:00:00'), tipo: 'SAIDA' }
      ];
      const mockReport = {
        id: 1,
        userId: 1,
        tipo: 'PONTO',
        periodoInicio: new Date('2024-01-01'),
        periodoFim: new Date('2024-01-31'),
        dados: JSON.stringify(mockRegistros)
      };

      (User.findByPk as jest.Mock).mockResolvedValue(mockUser);
      (RegistroPonto.findAll as jest.Mock).mockResolvedValue(mockRegistros);
      (Relatorio.create as jest.Mock).mockResolvedValue(mockReport);

      const report = await service.generatePointReport(
        1,
        new Date('2024-01-01'),
        new Date('2024-01-31')
      );

      expect(User.findByPk).toHaveBeenCalledWith(1);
      expect(RegistroPonto.findAll).toHaveBeenCalledWith({
        where: {
          userId: 1,
          data: {
            [expect.any(Symbol)]: [new Date('2024-01-01'), new Date('2024-01-31')]
          }
        },
        order: [['data', 'ASC']]
      });
      expect(Relatorio.create).toHaveBeenCalledWith({
        userId: 1,
        tipo: 'PONTO',
        periodoInicio: new Date('2024-01-01'),
        periodoFim: new Date('2024-01-31'),
        dados: JSON.stringify(mockRegistros)
      });
      expect(report).toEqual(mockReport);
    });

    it('should throw error when user not found', async () => {
      (User.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(service.generatePointReport(1, new Date(), new Date()))
        .rejects
        .toThrow('Usuário não encontrado');
    });
  });

  describe('generateHoursReport', () => {
    it('should generate hours report successfully', async () => {
      const mockUser = { id: 1 };
      const mockRegistros = [
        { id: 1, userId: 1, data: new Date('2024-01-01T08:00:00'), tipo: 'ENTRADA' },
        { id: 2, userId: 1, data: new Date('2024-01-01T12:00:00'), tipo: 'SAIDA' }
      ];
      const mockReport = {
        id: 1,
        userId: 1,
        tipo: 'HORAS',
        periodoInicio: new Date('2024-01-01'),
        periodoFim: new Date('2024-01-31'),
        dados: JSON.stringify({
          registros: mockRegistros,
          horasTrabalhadas: 4
        })
      };

      (User.findByPk as jest.Mock).mockResolvedValue(mockUser);
      (RegistroPonto.findAll as jest.Mock).mockResolvedValue(mockRegistros);
      (Relatorio.create as jest.Mock).mockResolvedValue(mockReport);

      const report = await service.generateHoursReport(
        1,
        new Date('2024-01-01'),
        new Date('2024-01-31')
      );

      expect(User.findByPk).toHaveBeenCalledWith(1);
      expect(RegistroPonto.findAll).toHaveBeenCalledWith({
        where: {
          userId: 1,
          data: {
            [expect.any(Symbol)]: [new Date('2024-01-01'), new Date('2024-01-31')]
          }
        },
        order: [['data', 'ASC']]
      });
      expect(Relatorio.create).toHaveBeenCalledWith({
        userId: 1,
        tipo: 'HORAS',
        periodoInicio: new Date('2024-01-01'),
        periodoFim: new Date('2024-01-31'),
        dados: expect.any(String)
      });
      expect(report).toEqual(mockReport);
    });
  });

  describe('calculateWorkedHours', () => {
    it('should calculate worked hours correctly', () => {
      const registros = [
        { data: new Date('2024-01-01T08:00:00'), tipo: 'ENTRADA' },
        { data: new Date('2024-01-01T12:00:00'), tipo: 'SAIDA' }
      ];

      const horas = service.calculateWorkedHours(registros);
      expect(horas).toBe(4);
    });

    it('should handle lunch break correctly', () => {
      const registros = [
        { data: new Date('2024-01-01T08:00:00'), tipo: 'ENTRADA' },
        { data: new Date('2024-01-01T12:00:00'), tipo: 'INICIO_ALMOCO' },
        { data: new Date('2024-01-01T13:00:00'), tipo: 'FIM_ALMOCO' },
        { data: new Date('2024-01-01T17:00:00'), tipo: 'SAIDA' }
      ];

      const horas = service.calculateWorkedHours(registros);
      expect(horas).toBe(8);
    });
  });

  describe('exportToPDF', () => {
    it('should throw error when report not found', async () => {
      (Relatorio.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(service.exportToPDF(1))
        .rejects
        .toThrow('Relatório não encontrado');
    });
  });

  describe('exportToExcel', () => {
    it('should throw error when report not found', async () => {
      (Relatorio.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(service.exportToExcel(1))
        .rejects
        .toThrow('Relatório não encontrado');
    });
  });
}); 