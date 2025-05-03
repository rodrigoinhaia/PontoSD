import 'dotenv/config';
import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { testConnection } from './config/database';
import logger from './utils/logger';
import { httpServer } from './config/server';
import routes from './routes';
import { startServer } from './config/server';

const app: Express = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'development' ? '*' : process.env.FRONTEND_URL,
    methods: ['GET', 'POST']
  }
});

// Middlewares básicos
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // limite de 100 requisições por IP
});
app.use(limiter);

// Servir arquivos estáticos
app.use('/public', express.static(path.join(__dirname, 'public')));

// Rotas básicas
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Configuração do Socket.IO para monitoramento em tempo real
io.on('connection', (socket) => {
  logger.info('Cliente conectado:', socket.id);

  socket.on('disconnect', () => {
    logger.info('Cliente desconectado:', socket.id);
  });
});

// Tratamento de erros
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  logger.error('Erro não tratado:', err);
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 3000;

// Testa a conexão com o banco de dados
testConnection()
  .then(() => {
    // Inicia o servidor
    httpServer.listen(PORT, () => {
      logger.info(`Servidor rodando na porta ${PORT}`);
      logger.info(`Ambiente: ${process.env.NODE_ENV}`);
    });
  })
  .catch((error) => {
    logger.error('Erro ao iniciar o servidor:', error);
    process.exit(1);
  });

// Tratamento de erros não capturados
process.on('uncaughtException', (error) => {
  logger.error('Erro não capturado:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Promessa rejeitada não tratada:', reason);
});

startServer(); 