import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { authController } from '../controllers/auth.controller';
import {
  validateLogin,
  validateRefreshToken,
  validateForgotPassword,
  validateResetPassword,
} from '../middlewares/validators/auth.validator';
import { userRoutes } from './user.routes';
import { companyRoutes } from './company.routes';
import { departmentRoutes } from './department.routes';
import { scheduleRoutes } from './schedule.routes';
import { pointRoutes } from './point.routes';
import { reportRoutes } from './report.routes';
import { authLimiter, apiLimiter, reportLimiter } from '../middlewares/rate-limit.middleware';
import { corsMiddleware } from '../middlewares/cors.middleware';
import { sanitizeMiddleware } from '../middlewares/sanitize.middleware';
import { auditMiddleware } from '../middlewares/audit.middleware';

const router = Router();

// Middlewares globais
router.use(corsMiddleware);
router.use(sanitizeMiddleware);
router.use(auditMiddleware);

// Rotas públicas com rate limit específico
router.post('/auth/login', authLimiter, validateLogin, authController.login);
router.post('/auth/refresh-token', authLimiter, validateRefreshToken, authController.refreshToken);
router.post('/auth/forgot-password', authLimiter, validateForgotPassword, authController.forgotPassword);
router.post('/auth/reset-password', authLimiter, validateResetPassword, authController.resetPassword);

// Middleware de autenticação
router.use(authMiddleware);

// Rotas protegidas com rate limit padrão
router.use('/users', apiLimiter, userRoutes);
router.use('/companies', apiLimiter, companyRoutes);
router.use('/departments', apiLimiter, departmentRoutes);
router.use('/schedules', apiLimiter, scheduleRoutes);
router.use('/points', apiLimiter, pointRoutes);
router.use('/reports', reportLimiter, reportRoutes);

export default router; 