import compression from 'compression';
import cors from 'cors';
import express from 'express';
import { createServer } from 'http';
import morgan from 'morgan';
import { Server } from 'socket.io';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import { env } from './env';
import { logger } from '../utils/logger';
import { connectRedis } from './redis';
import { connectDatabase } from './database';
import routes from '../routes';
import { errorHandler } from '../middlewares/error.middleware';

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: env.FRONTEND_URL,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(compression());

if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limite de 100 requisições por IP
  message: 'Muitas requisições deste IP, tente novamente mais tarde',
});

app.use(limiter);

// Routes
app.use('/api', routes);

// Error handling
app.use(errorHandler);

// Socket.IO
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);

  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

// Start server
const startServer = async () => {
  try {
    await connectDatabase();
    await connectRedis();

    const port = env.PORT;
    httpServer.listen(port, () => {
      logger.info(`Server is running on port ${port}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Configurações
app.set('trust proxy', 1);
app.set('port', env.PORT);

export { app, httpServer, io, startServer }; 