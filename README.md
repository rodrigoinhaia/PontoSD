# PontoSD - Sistema de Ponto Digital

Sistema de ponto digital moderno e eficiente para gerenciamento de presença e horas trabalhadas.

## 🚀 Tecnologias

- Node.js
- TypeScript
- Express
- PostgreSQL
- Redis
- JWT
- Zod
- Jest
- Docker

## 📋 Pré-requisitos

- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- Docker (opcional)

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/pontosd.git
cd pontosd
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```
Edite o arquivo `.env` com suas configurações.

4. Crie os bancos de dados:
```bash
# Desenvolvimento
createdb pontosdigital_dev

# Teste
createdb pontosdigital_test
```

5. Execute as migrações:
```bash
# Desenvolvimento
npm run migrate:dev

# Teste
npm run migrate:test
```

6. Inicie o servidor:
```bash
# Desenvolvimento
npm run dev

# Produção
npm run build
npm start
```

## 🏃‍♂️ Scripts Disponíveis

- `npm run dev`: Inicia o servidor em modo de desenvolvimento
- `npm run build`: Compila o projeto
- `npm start`: Inicia o servidor em modo de produção
- `npm test`: Executa os testes
- `npm run test:coverage`: Executa os testes com cobertura
- `npm run lint`: Executa o linter
- `npm run lint:fix`: Corrige problemas de linting
- `npm run migrate:dev`: Executa as migrações no banco de desenvolvimento
- `npm run migrate:test`: Executa as migrações no banco de teste
- `npm run migrate:prod`: Executa as migrações no banco de produção

## 🌍 Variáveis de Ambiente

### App
- `PORT`: Porta do servidor (default: 3000)
- `NODE_ENV`: Ambiente (development, test, production)

### Database
- `DB_USERNAME`: Usuário do banco de dados
- `DB_PASSWORD`: Senha do banco de dados
- `DB_DATABASE`: Nome do banco de dados
- `DB_HOST`: Host do banco de dados
- `DB_PORT`: Porta do banco de dados

### Redis
- `REDIS_HOST`: Host do Redis
- `REDIS_PORT`: Porta do Redis

### JWT
- `JWT_SECRET`: Chave secreta para tokens JWT
- `JWT_EXPIRES_IN`: Tempo de expiração do token JWT
- `JWT_REFRESH_EXPIRES_IN`: Tempo de expiração do refresh token
- `REFRESH_TOKEN_SECRET`: Chave secreta para refresh tokens

### Email
- `SMTP_HOST`: Host do servidor SMTP
- `SMTP_PORT`: Porta do servidor SMTP
- `SMTP_USER`: Usuário SMTP
- `SMTP_PASS`: Senha SMTP
- `EMAIL_FROM`: Email de envio

### Geolocation
- `GOOGLE_MAPS_API_KEY`: Chave da API do Google Maps
- `MAX_DISTANCE_METERS`: Distância máxima permitida em metros

### Upload
- `UPLOAD_DIR`: Diretório para uploads
- `MAX_FILE_SIZE`: Tamanho máximo de arquivo em bytes

### Time
- `TIMEZONE`: Fuso horário
- `WORKING_HOURS_START`: Hora de início do expediente
- `WORKING_HOURS_END`: Hora de fim do expediente
- `LUNCH_BREAK_START`: Hora de início do almoço
- `LUNCH_BREAK_END`: Hora de fim do almoço

### Log
- `LOG_LEVEL`: Nível de log
- `LOG_FILE`: Arquivo de log

### Rate Limit
- `RATE_LIMIT_WINDOW_MS`: Janela de tempo para rate limit
- `RATE_LIMIT_MAX`: Número máximo de requisições por janela

### URLs
- `API_URL`: URL da API
- `FRONTEND_URL`: URL do frontend
- `CORS_ORIGIN`: Origem permitida para CORS

## 📁 Estrutura do Projeto

```
src/
├── config/         # Configurações
├── controllers/    # Controladores
├── middlewares/    # Middlewares
├── models/         # Modelos
├── routes/         # Rotas
├── services/       # Serviços
├── utils/          # Utilitários
└── app.ts          # Aplicação Express
```

## 🧪 Testes

O projeto usa Jest para testes. Para executar os testes:

```bash
# Todos os testes
npm test

# Com cobertura
npm run test:coverage
```

## 🐳 Docker

Para executar com Docker:

```bash
# Desenvolvimento
docker-compose up -d

# Produção
docker-compose -f docker-compose.prod.yml up -d
```

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## ✨ Contribuição

1. Faça o fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request 