import { Request, Response } from 'express';
import { Schedule, User } from '../models';
import { logger } from '../utils/logger';

export const scheduleController = {
  create: async (req: Request, res: Response) => {
    try {
      const { userId, dayOfWeek, startTime, endTime, breakStartTime, breakEndTime } = req.body;

      const user = await User.findByPk(userId);

      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      const existingSchedule = await Schedule.findOne({
        where: { userId, dayOfWeek },
      });

      if (existingSchedule) {
        return res.status(400).json({ message: 'Já existe um horário para este dia' });
      }

      const schedule = await Schedule.create({
        userId,
        dayOfWeek,
        startTime,
        endTime,
        breakStartTime,
        breakEndTime,
      });

      return res.status(201).json({
        id: schedule.id,
        userId: schedule.userId,
        dayOfWeek: schedule.dayOfWeek,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        breakStartTime: schedule.breakStartTime,
        breakEndTime: schedule.breakEndTime,
      });
    } catch (error) {
      logger.error('Erro ao criar horário:', error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  },

  findAll: async (req: Request, res: Response) => {
    try {
      const schedules = await Schedule.findAll({
        attributes: [
          'id',
          'dayOfWeek',
          'startTime',
          'endTime',
          'breakStartTime',
          'breakEndTime',
          'active',
          'createdAt',
        ],
        include: ['user'],
      });

      return res.json(schedules);
    } catch (error) {
      logger.error('Erro ao buscar horários:', error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  },

  findOne: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const schedule = await Schedule.findByPk(id, {
        attributes: [
          'id',
          'dayOfWeek',
          'startTime',
          'endTime',
          'breakStartTime',
          'breakEndTime',
          'active',
          'createdAt',
        ],
        include: ['user'],
      });

      if (!schedule) {
        return res.status(404).json({ message: 'Horário não encontrado' });
      }

      return res.json(schedule);
    } catch (error) {
      logger.error('Erro ao buscar horário:', error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { userId, dayOfWeek, startTime, endTime, breakStartTime, breakEndTime, active } = req.body;

      const schedule = await Schedule.findByPk(id);

      if (!schedule) {
        return res.status(404).json({ message: 'Horário não encontrado' });
      }

      if (userId) {
        const user = await User.findByPk(userId);

        if (!user) {
          return res.status(404).json({ message: 'Usuário não encontrado' });
        }
      }

      if (dayOfWeek && dayOfWeek !== schedule.dayOfWeek) {
        const existingSchedule = await Schedule.findOne({
          where: { userId: userId || schedule.userId, dayOfWeek },
        });

        if (existingSchedule) {
          return res.status(400).json({ message: 'Já existe um horário para este dia' });
        }
      }

      await schedule.update({
        userId,
        dayOfWeek,
        startTime,
        endTime,
        breakStartTime,
        breakEndTime,
        active,
      });

      return res.json({
        id: schedule.id,
        userId: schedule.userId,
        dayOfWeek: schedule.dayOfWeek,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        breakStartTime: schedule.breakStartTime,
        breakEndTime: schedule.breakEndTime,
        active: schedule.active,
      });
    } catch (error) {
      logger.error('Erro ao atualizar horário:', error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  },

  remove: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const schedule = await Schedule.findByPk(id);

      if (!schedule) {
        return res.status(404).json({ message: 'Horário não encontrado' });
      }

      await schedule.destroy();

      return res.status(204).send();
    } catch (error) {
      logger.error('Erro ao remover horário:', error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  },
}; 