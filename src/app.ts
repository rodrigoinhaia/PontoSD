import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { connectDatabase } from './config/database';
import { syncDatabase } from './config/sync-database';
import { seedDatabase } from './config/seed-database';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/error.middleware';
import { authRoutes } from './routes/auth.routes';
import { userRoutes } from './routes/user.routes';
import { companyRoutes } from './routes/company.routes';
import { departmentRoutes } from './routes/department.routes';
import { scheduleRoutes } from './routes/schedule.routes';
import { pointRoutes } from './routes/point.routes';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/points', pointRoutes);

// Error handling
app.use(errorHandler);

// Inicialização
const initializeApp = async (): Promise<void> => {
  try {
    await connectDatabase();
    await syncDatabase();
    await seedDatabase();
    logger.info('Application initialized successfully');
  } catch (error) {
    logger.error('Error initializing application:', error);
    process.exit(1);
  }
};

export { app, initializeApp }; 