import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validation.middleware';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { scheduleController } from '../controllers/schedule.controller';

const router = Router();

// Rotas protegidas
router.use(protect);

// Rotas de administrador
router.use(restrictTo('admin'));

router.post(
  '/',
  [
    body('userId').isInt().withMessage('ID do usuário inválido'),
    body('dayOfWeek').isIn(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']).withMessage('Dia da semana inválido'),
    body('startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Horário de início inválido'),
    body('endTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Horário de término inválido'),
    body('breakStartTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Horário de início do intervalo inválido'),
    body('breakEndTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Horário de término do intervalo inválido'),
  ],
  validate,
  scheduleController.create
);

router.get('/', scheduleController.findAll);

router.get('/:id', scheduleController.findOne);

router.put(
  '/:id',
  [
    body('userId').optional().isInt().withMessage('ID do usuário inválido'),
    body('dayOfWeek').optional().isIn(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']).withMessage('Dia da semana inválido'),
    body('startTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Horário de início inválido'),
    body('endTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Horário de término inválido'),
    body('breakStartTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Horário de início do intervalo inválido'),
    body('breakEndTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Horário de término do intervalo inválido'),
    body('active').optional().isBoolean().withMessage('Status inválido'),
  ],
  validate,
  scheduleController.update
);

router.delete('/:id', scheduleController.remove);

export const scheduleRoutes = router; 