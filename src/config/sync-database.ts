import { sequelize } from './database';
import { User, Company, Department, Schedule, Point } from '../models';
import { logger } from '../utils/logger';

export const syncDatabase = async (): Promise<void> => {
  try {
    // Sincroniza os modelos na ordem correta para evitar problemas de chave estrangeira
    await Company.sync({ force: false });
    await Department.sync({ force: false });
    await User.sync({ force: false });
    await Schedule.sync({ force: false });
    await Point.sync({ force: false });

    logger.info('Database synchronized successfully');
  } catch (error) {
    logger.error('Error synchronizing database:', error);
    throw error;
  }
}; 