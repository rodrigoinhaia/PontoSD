import { Request, Response } from 'express';
import { Point, User } from '../models';
import { logger } from '../utils/logger';
import { Op } from 'sequelize';

export const pointController = {
  create: async (req: Request, res: Response) => {
    try {
      const { type, latitude, longitude, address } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: 'Usuário não autenticado' });
      }

      const user = await User.findByPk(userId);

      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      // Verifica se já existe um ponto do mesmo tipo no mesmo dia
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const existingPoint = await Point.findOne({
        where: {
          userId,
          type,
          createdAt: {
            [Op.gte]: today,
          },
        },
      });

      if (existingPoint) {
        return res.status(400).json({ 
          message: `Já existe um ponto de ${type === 'entry' ? 'entrada' : 'saída'} registrado hoje` 
        });
      }

      const point = await Point.create({
        userId,
        type,
        latitude,
        longitude,
        address,
      });

      return res.status(201).json({
        id: point.id,
        type: point.type,
        latitude: point.latitude,
        longitude: point.longitude,
        address: point.address,
        createdAt: point.createdAt,
      });
    } catch (error) {
      logger.error('Erro ao registrar ponto:', error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  },

  findAll: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: 'Usuário não autenticado' });
      }

      const points = await Point.findAll({
        where: { userId },
        attributes: [
          'id',
          'type',
          'latitude',
          'longitude',
          'address',
          'createdAt',
        ],
        order: [['createdAt', 'DESC']],
      });

      return res.json(points);
    } catch (error) {
      logger.error('Erro ao buscar pontos:', error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  },

  findOne: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: 'Usuário não autenticado' });
      }

      const point = await Point.findOne({
        where: { id, userId },
        attributes: [
          'id',
          'type',
          'latitude',
          'longitude',
          'address',
          'createdAt',
        ],
      });

      if (!point) {
        return res.status(404).json({ message: 'Ponto não encontrado' });
      }

      return res.json(point);
    } catch (error) {
      logger.error('Erro ao buscar ponto:', error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  },

  findByDate: async (req: Request, res: Response) => {
    try {
      const { date } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: 'Usuário não autenticado' });
      }

      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      const points = await Point.findAll({
        where: {
          userId,
          createdAt: {
            [Op.between]: [startDate, endDate],
          },
        },
        attributes: [
          'id',
          'type',
          'latitude',
          'longitude',
          'address',
          'createdAt',
        ],
        order: [['createdAt', 'ASC']],
      });

      return res.json(points);
    } catch (error) {
      logger.error('Erro ao buscar pontos por data:', error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  },
}; 