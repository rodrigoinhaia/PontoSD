import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validation.middleware';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { departmentController } from '../controllers/department.controller';

const router = Router();

// Rotas protegidas
router.use(protect);

// Rotas de administrador
router.use(restrictTo('admin'));

router.post(
  '/',
  [
    body('name').isLength({ min: 3 }).withMessage('Nome deve ter no mínimo 3 caracteres'),
    body('description').isLength({ min: 5 }).withMessage('Descrição deve ter no mínimo 5 caracteres'),
    body('companyId').isInt().withMessage('ID da empresa inválido'),
  ],
  validate,
  departmentController.create
);

router.get('/', departmentController.findAll);

router.get('/:id', departmentController.findOne);

router.put(
  '/:id',
  [
    body('name').optional().isLength({ min: 3 }).withMessage('Nome deve ter no mínimo 3 caracteres'),
    body('description').optional().isLength({ min: 5 }).withMessage('Descrição deve ter no mínimo 5 caracteres'),
    body('companyId').optional().isInt().withMessage('ID da empresa inválido'),
    body('active').optional().isBoolean().withMessage('Status inválido'),
  ],
  validate,
  departmentController.update
);

router.delete('/:id', departmentController.remove);

export const departmentRoutes = router; 