import { Router } from 'express';
import RegistroPontoController from '../controllers/RegistroPontoController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// Registrar ponto
router.post('/', RegistroPontoController.registrarPonto);

// Listar registros
router.get('/', RegistroPontoController.listarRegistros);

// Justificar registro
router.put('/:id/justificar', RegistroPontoController.justificarRegistro);

export default router; 