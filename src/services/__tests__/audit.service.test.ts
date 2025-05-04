import { AuditService } from '../audit.service';
import { Auditoria } from '../../models/auditoria.model';

jest.mock('../../models/auditoria.model');

describe('AuditService', () => {
  let service: AuditService;

  beforeEach(() => {
    service = AuditService.getInstance();
    jest.clearAllMocks();
  });

  describe('logAction', () => {
    it('should log action successfully', async () => {
      const mockAudit = {
        id: 1,
        userId: 1,
        entidade: 'User',
        entidadeId: 1,
        acao: 'UPDATE',
        valorAntigo: JSON.stringify({ name: 'Old' }),
        valorNovo: JSON.stringify({ name: 'New' })
      };

      (Auditoria.create as jest.Mock).mockResolvedValue(mockAudit);

      const audit = await service.logAction(
        1,
        'User',
        1,
        'UPDATE',
        { name: 'Old' },
        { name: 'New' }
      );

      expect(Auditoria.create).toHaveBeenCalledWith({
        userId: 1,
        entidade: 'User',
        entidadeId: 1,
        acao: 'UPDATE',
        valorAntigo: JSON.stringify({ name: 'Old' }),
        valorNovo: JSON.stringify({ name: 'New' })
      });
      expect(audit).toEqual(mockAudit);
    });

    it('should throw error when logging fails', async () => {
      (Auditoria.create as jest.Mock).mockRejectedValue(new Error('DB Error'));

      await expect(service.logAction(1, 'User', 1, 'UPDATE', {}, {}))
        .rejects
        .toThrow('Erro ao registrar ação de auditoria');
    });
  });

  describe('getEntityHistory', () => {
    it('should return entity history successfully', async () => {
      const mockAudits = [
        { id: 1, entidade: 'User', entidadeId: 1 },
        { id: 2, entidade: 'User', entidadeId: 1 }
      ];

      (Auditoria.findAll as jest.Mock).mockResolvedValue(mockAudits);

      const audits = await service.getEntityHistory('User', 1);

      expect(Auditoria.findAll).toHaveBeenCalledWith({
        where: {
          entidade: 'User',
          entidadeId: 1
        },
        order: [['createdAt', 'DESC']]
      });
      expect(audits).toEqual(mockAudits);
    });

    it('should throw error when fetching history fails', async () => {
      (Auditoria.findAll as jest.Mock).mockRejectedValue(new Error('DB Error'));

      await expect(service.getEntityHistory('User', 1))
        .rejects
        .toThrow('Erro ao obter histórico de auditoria');
    });
  });

  describe('getUserHistory', () => {
    it('should return user history successfully', async () => {
      const mockAudits = [
        { id: 1, userId: 1 },
        { id: 2, userId: 1 }
      ];

      (Auditoria.findAll as jest.Mock).mockResolvedValue(mockAudits);

      const audits = await service.getUserHistory(1);

      expect(Auditoria.findAll).toHaveBeenCalledWith({
        where: {
          userId: 1
        },
        order: [['createdAt', 'DESC']]
      });
      expect(audits).toEqual(mockAudits);
    });

    it('should throw error when fetching user history fails', async () => {
      (Auditoria.findAll as jest.Mock).mockRejectedValue(new Error('DB Error'));

      await expect(service.getUserHistory(1))
        .rejects
        .toThrow('Erro ao obter histórico de auditoria do usuário');
    });
  });

  describe('getActionHistory', () => {
    it('should return action history successfully', async () => {
      const mockAudits = [
        { id: 1, acao: 'UPDATE' },
        { id: 2, acao: 'UPDATE' }
      ];

      (Auditoria.findAll as jest.Mock).mockResolvedValue(mockAudits);

      const audits = await service.getActionHistory('UPDATE');

      expect(Auditoria.findAll).toHaveBeenCalledWith({
        where: {
          acao: 'UPDATE'
        },
        order: [['createdAt', 'DESC']]
      });
      expect(audits).toEqual(mockAudits);
    });

    it('should throw error when fetching action history fails', async () => {
      (Auditoria.findAll as jest.Mock).mockRejectedValue(new Error('DB Error'));

      await expect(service.getActionHistory('UPDATE'))
        .rejects
        .toThrow('Erro ao obter histórico de auditoria por ação');
    });
  });
}); 