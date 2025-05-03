import rateLimit from 'express-rate-limit';
import { env } from './env';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: env.NODE_ENV === 'development' ? 1000 : 100, // limite de requisições
  message: {
    status: 'error',
    message: 'Muitas requisições, por favor tente novamente mais tarde.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export { limiter }; 