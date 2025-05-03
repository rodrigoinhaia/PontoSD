import { Router } from 'express';
import { pointController } from '../controllers/point.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validatePoint } from '../middlewares/validators/point.validator';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// Registrar ponto
router.post('/', validatePoint, (req, res) => pointController.create(req, res));

// Listar todos os pontos do usuário
router.get('/', (req, res) => pointController.findAll(req, res));

// Buscar ponto específico
router.get('/:id', (req, res) => pointController.findOne(req, res));

// Buscar pontos por data (formato: YYYY-MM-DD)
router.get('/date/:date', (req, res) => pointController.findByDate(req, res));

export default router; 