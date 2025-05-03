import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validation.middleware';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { userController } from '../controllers/user.controller';

const router = Router();

// Rotas protegidas
router.use(protect);

// Rotas de administrador
router.use(restrictTo('admin'));

router.post(
  '/',
  [
    body('name').isLength({ min: 3 }).withMessage('Nome deve ter no mínimo 3 caracteres'),
    body('email').isEmail().withMessage('Email inválido'),
    body('password').isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres'),
    body('role').isIn(['admin', 'user']).withMessage('Função inválida'),
    body('companyId').isInt().withMessage('ID da empresa inválido'),
    body('departmentId').isInt().withMessage('ID do departamento inválido'),
  ],
  validate,
  userController.create
);

router.get('/', userController.findAll);

router.get('/:id', userController.findOne);

router.put(
  '/:id',
  [
    body('name').optional().isLength({ min: 3 }).withMessage('Nome deve ter no mínimo 3 caracteres'),
    body('email').optional().isEmail().withMessage('Email inválido'),
    body('password').optional().isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres'),
    body('role').optional().isIn(['admin', 'user']).withMessage('Função inválida'),
    body('active').optional().isBoolean().withMessage('Status inválido'),
    body('companyId').optional().isInt().withMessage('ID da empresa inválido'),
    body('departmentId').optional().isInt().withMessage('ID do departamento inválido'),
  ],
  validate,
  userController.update
);

router.delete('/:id', userController.remove);

export const userRoutes = router; 