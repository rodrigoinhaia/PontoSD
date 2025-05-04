import { Auditoria } from '../models/auditoria.model';
import { logger } from '../utils/logger';

export class AuditService {
  private static instance: AuditService;

  private constructor() {}

  public static getInstance(): AuditService {
    if (!AuditService.instance) {
      AuditService.instance = new AuditService();
    }
    return AuditService.instance;
  }

  /**
   * Registra uma ação de auditoria
   */
  public async logAction(
    userId: number,
    entity: string,
    entityId: number,
    action: string,
    oldValue: any,
    newValue: any
  ): Promise<Auditoria> {
    try {
      return await Auditoria.create({
        userId,
        entidade: entity,
        entidadeId: entityId,
        acao: action,
        valorAntigo: JSON.stringify(oldValue),
        valorNovo: JSON.stringify(newValue),
      });
    } catch (error) {
      logger.error('Erro ao registrar ação de auditoria:', error);
      throw new Error('Erro ao registrar ação de auditoria');
    }
  }

  /**
   * Obtém o histórico de auditoria de uma entidade
   */
  public async getEntityHistory(
    entity: string,
    entityId: number
  ): Promise<Auditoria[]> {
    try {
      return await Auditoria.findAll({
        where: {
          entidade: entity,
          entidadeId: entityId,
        },
        order: [['createdAt', 'DESC']],
      });
    } catch (error) {
      logger.error('Erro ao obter histórico de auditoria:', error);
      throw new Error('Erro ao obter histórico de auditoria');
    }
  }

  /**
   * Obtém o histórico de auditoria de um usuário
   */
  public async getUserHistory(userId: number): Promise<Auditoria[]> {
    try {
      return await Auditoria.findAll({
        where: {
          userId,
        },
        order: [['createdAt', 'DESC']],
      });
    } catch (error) {
      logger.error('Erro ao obter histórico de auditoria do usuário:', error);
      throw new Error('Erro ao obter histórico de auditoria do usuário');
    }
  }

  /**
   * Obtém o histórico de auditoria por tipo de ação
   */
  public async getActionHistory(action: string): Promise<Auditoria[]> {
    try {
      return await Auditoria.findAll({
        where: {
          acao: action,
        },
        order: [['createdAt', 'DESC']],
      });
    } catch (error) {
      logger.error('Erro ao obter histórico de auditoria por ação:', error);
      throw new Error('Erro ao obter histórico de auditoria por ação');
    }
  }
} 