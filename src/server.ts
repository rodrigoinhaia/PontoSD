import 'dotenv/config';

import { createServer } from 'http';
import compression from 'compression';
import cors from 'cors';
import express, { Express, NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import path from 'path';
import rateLimit from 'express-rate-limit';
import { Server } from 'socket.io';

import { connectDatabase } from './config/database';
import { logger } from './utils/logger';
import routes from './routes';

const app: Express = express();
const httpServer = createServer(app);

// Configuração do CORS
const corsOptions = {
  origin:
    process.env.NODE_ENV === 'development'
      ? '*'
      : process.env.FRONTEND_URL?.split(',').map(url => url.trim()),
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400, // 24 horas
};

// Middlewares básicos
app.use(helmet());
app.use(cors(corsOptions));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limite de 100 requisições por IP
  message: 'Muitas requisições deste IP, por favor tente novamente mais tarde.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Timeout
app.use((req: Request, res: Response, next: NextFunction) => {
  req.setTimeout(30000); // 30 segundos
  res.setTimeout(30000);
  next();
});

// Servir arquivos estáticos
app.use('/public', express.static(path.join(__dirname, 'public')));

// Rotas básicas
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version,
  });
});

// Configuração do Socket.IO para monitoramento em tempo real
const io = new Server(httpServer, {
  cors: corsOptions,
  pingTimeout: 60000,
  pingInterval: 25000,
  connectTimeout: 45000,
});

io.on('connection', socket => {
  logger.info('Cliente conectado:', socket.id);

  socket.on('disconnect', () => {
    logger.info('Cliente desconectado:', socket.id);
  });

  socket.on('error', error => {
    logger.error('Erro no socket:', error);
  });
});

// Rotas da aplicação
app.use('/api', routes);

// Tratamento de erros
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  logger.error('Erro não tratado:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
  });

  const statusCode = err.name === 'ValidationError' ? 400 : 500;

  res.status(statusCode).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Rota 404
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    error: 'Rota não encontrada',
  });
});

const PORT = process.env.PORT || 3000;

// Testa a conexão com o banco de dados e inicia o servidor
const startServer = async () => {
  try {
    await connectDatabase();

    httpServer.listen(PORT, () => {
      logger.info(`Servidor rodando na porta ${PORT}`);
      logger.info(`Ambiente: ${process.env.NODE_ENV}`);
      logger.info(`URL: ${process.env.API_URL || `http://localhost:${PORT}`}`);
    });
  } catch (error) {
    logger.error('Erro ao iniciar o servidor:', error);
    process.exit(1);
  }
};

// Tratamento de erros não capturados
process.on('uncaughtException', error => {
  logger.error('Erro não capturado:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Promessa rejeitada não tratada:', {
    reason,
    promise,
  });
});

// Inicia o servidor
startServer();
