import { CacheService } from './cache.service';
import { Justification } from '../models/justification.model';
import { logger } from '../utils/logger';

export class JustificationService {
  private static instance: JustificationService;
  private cacheService: CacheService;

  private constructor() {
    this.cacheService = CacheService.getInstance();
  }

  public static getInstance(): JustificationService {
    if (!JustificationService.instance) {
      JustificationService.instance = new JustificationService();
    }
    return JustificationService.instance;
  }

  async createJustification(
    pointId: number,
    userId: number,
    reason: string,
    status: 'PENDING' | 'APPROVED' | 'REJECTED' = 'PENDING'
  ): Promise<Justification> {
    try {
      const justification = await Justification.create({
        pointId,
        userId,
        reason,
        status,
      });

      await this.cacheService.del(`point:${pointId}`);
      await this.cacheService.del(`justifications:point:${pointId}`);
      await this.cacheService.del(`justifications:user:${userId}`);

      return justification;
    } catch (error) {
      logger.error('Erro ao criar justificativa:', error);
      throw new Error('Erro ao criar justificativa');
    }
  }

  async getJustificationById(id: number): Promise<Justification | null> {
    try {
      const cachedJustification = await this.cacheService.getJson(`justification:${id}`);
      if (cachedJustification) {
        return cachedJustification;
      }

      const justification = await Justification.findByPk(id);
      if (justification) {
        await this.cacheService.setJson(`justification:${id}`, justification, 3600);
      }

      return justification;
    } catch (error) {
      logger.error('Erro ao buscar justificativa:', error);
      throw new Error('Erro ao buscar justificativa');
    }
  }

  async getJustificationsByPoint(pointId: number): Promise<Justification[]> {
    try {
      const cachedJustifications = await this.cacheService.getJson(
        `justifications:point:${pointId}`
      );
      if (cachedJustifications) {
        return cachedJustifications;
      }

      const justifications = await Justification.findAll({
        where: { pointId },
        order: [['createdAt', 'DESC']],
      });

      await this.cacheService.setJson(
        `justifications:point:${pointId}`,
        justifications,
        3600
      );

      return justifications;
    } catch (error) {
      logger.error('Erro ao buscar justificativas do ponto:', error);
      throw new Error('Erro ao buscar justificativas do ponto');
    }
  }

  async getJustificationsByUser(userId: number): Promise<Justification[]> {
    try {
      const cachedJustifications = await this.cacheService.getJson(
        `justifications:user:${userId}`
      );
      if (cachedJustifications) {
        return cachedJustifications;
      }

      const justifications = await Justification.findAll({
        where: { userId },
        order: [['createdAt', 'DESC']],
      });

      await this.cacheService.setJson(
        `justifications:user:${userId}`,
        justifications,
        3600
      );

      return justifications;
    } catch (error) {
      logger.error('Erro ao buscar justificativas do usuário:', error);
      throw new Error('Erro ao buscar justificativas do usuário');
    }
  }

  async updateJustificationStatus(
    id: number,
    status: 'APPROVED' | 'REJECTED',
    managerId: number
  ): Promise<Justification | null> {
    try {
      const justification = await Justification.findByPk(id);
      if (!justification) {
        return null;
      }

      const oldStatus = justification.status;
      await justification.update({ status });

      await this.cacheService.del(`justification:${id}`);
      await this.cacheService.del(`justifications:point:${justification.pointId}`);
      await this.cacheService.del(`justifications:user:${justification.userId}`);

      return justification;
    } catch (error) {
      logger.error('Erro ao atualizar status da justificativa:', error);
      throw new Error('Erro ao atualizar status da justificativa');
    }
  }

  async deleteJustification(id: number): Promise<boolean> {
    try {
      const justification = await Justification.findByPk(id);
      if (!justification) {
        return false;
      }

      await justification.destroy();

      await this.cacheService.del(`justification:${id}`);
      await this.cacheService.del(`justifications:point:${justification.pointId}`);
      await this.cacheService.del(`justifications:user:${justification.userId}`);

      return true;
    } catch (error) {
      logger.error('Erro ao remover justificativa:', error);
      throw new Error('Erro ao remover justificativa');
    }
  }
} 