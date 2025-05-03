import { Router } from 'express';
import { reportController } from '../controllers/report.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/daily', reportController.generateDailyReport);
router.get('/monthly', reportController.generateMonthlyReport);

export const reportRoutes = router; 