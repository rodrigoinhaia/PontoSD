import { Request, Response } from 'express';
import { Point, Report, User } from '../models';
import { logger } from '../utils/logger';
import { Op } from 'sequelize';

export const reportController = {
  generateDailyReport: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const { date } = req.query;

      if (!userId) {
        return res.status(401).json({ message: 'Usuário não autenticado' });
      }

      const user = await User.findByPk(userId);

      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      const reportDate = date ? new Date(date as string) : new Date();
      reportDate.setHours(0, 0, 0, 0);

      const nextDay = new Date(reportDate);
      nextDay.setDate(nextDay.getDate() + 1);

      const points = await Point.findAll({
        where: {
          userId,
          createdAt: {
            [Op.between]: [reportDate, nextDay],
          },
        },
        order: [['createdAt', 'ASC']],
      });

      const reportData = {
        date: reportDate.toISOString().split('T')[0],
        points: points.map(point => ({
          id: point.id,
          type: point.type,
          time: point.createdAt,
          address: point.address,
        })),
        totalPoints: points.length,
        hasEntry: points.some(point => point.type === 'entry'),
        hasExit: points.some(point => point.type === 'exit'),
      };

      const report = await Report.create({
        userId,
        type: 'daily',
        startDate: reportDate,
        endDate: nextDay,
        data: reportData,
      });

      return res.json(reportData);
    } catch (error) {
      logger.error('Erro ao gerar relatório diário:', error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  },

  generateMonthlyReport: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const { year, month } = req.query;

      if (!userId) {
        return res.status(401).json({ message: 'Usuário não autenticado' });
      }

      const user = await User.findByPk(userId);

      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      const reportYear = year ? parseInt(year as string) : new Date().getFullYear();
      const reportMonth = month ? parseInt(month as string) - 1 : new Date().getMonth();

      const startDate = new Date(reportYear, reportMonth, 1);
      const endDate = new Date(reportYear, reportMonth + 1, 0);
      endDate.setHours(23, 59, 59, 999);

      const points = await Point.findAll({
        where: {
          userId,
          createdAt: {
            [Op.between]: [startDate, endDate],
          },
        },
        order: [['createdAt', 'ASC']],
      });

      const days = new Map<string, any>();

      points.forEach(point => {
        const date = point.createdAt.toISOString().split('T')[0];
        if (!days.has(date)) {
          days.set(date, {
            date,
            points: [],
            hasEntry: false,
            hasExit: false,
          });
        }

        const day = days.get(date);
        day.points.push({
          id: point.id,
          type: point.type,
          time: point.createdAt,
          address: point.address,
        });

        if (point.type === 'entry') day.hasEntry = true;
        if (point.type === 'exit') day.hasExit = true;
      });

      const reportData = {
        year: reportYear,
        month: reportMonth + 1,
        days: Array.from(days.values()),
        totalPoints: points.length,
        totalDays: days.size,
        daysWithEntry: Array.from(days.values()).filter(day => day.hasEntry).length,
        daysWithExit: Array.from(days.values()).filter(day => day.hasExit).length,
      };

      const report = await Report.create({
        userId,
        type: 'monthly',
        startDate,
        endDate,
        data: reportData,
      });

      return res.json(reportData);
    } catch (error) {
      logger.error('Erro ao gerar relatório mensal:', error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  },
}; 