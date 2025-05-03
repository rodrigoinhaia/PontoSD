import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validation.middleware';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { companyController } from '../controllers/company.controller';

const router = Router();

// Rotas protegidas
router.use(protect);

// Rotas de administrador
router.use(restrictTo('admin'));

router.post(
  '/',
  [
    body('name').isLength({ min: 3 }).withMessage('Nome deve ter no mínimo 3 caracteres'),
    body('cnpj').isLength({ min: 14, max: 14 }).withMessage('CNPJ inválido'),
    body('address').isLength({ min: 5 }).withMessage('Endereço inválido'),
    body('phone').isLength({ min: 10 }).withMessage('Telefone inválido'),
    body('email').isEmail().withMessage('Email inválido'),
  ],
  validate,
  companyController.create
);

router.get('/', companyController.findAll);

router.get('/:id', companyController.findOne);

router.put(
  '/:id',
  [
    body('name').optional().isLength({ min: 3 }).withMessage('Nome deve ter no mínimo 3 caracteres'),
    body('cnpj').optional().isLength({ min: 14, max: 14 }).withMessage('CNPJ inválido'),
    body('address').optional().isLength({ min: 5 }).withMessage('Endereço inválido'),
    body('phone').optional().isLength({ min: 10 }).withMessage('Telefone inválido'),
    body('email').optional().isEmail().withMessage('Email inválido'),
    body('active').optional().isBoolean().withMessage('Status inválido'),
  ],
  validate,
  companyController.update
);

router.delete('/:id', companyController.remove);

export const companyRoutes = router; 