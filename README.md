# PontoSD - Sistema de Ponto Digital

Sistema de ponto digital desenvolvido com Node.js, TypeScript, PostgreSQL e Sequelize.

## Requisitos

- Node.js >= 14.x
- PostgreSQL >= 12.x
- npm ou yarn

## Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/pontosdigital.git
cd pontosdigital
```

2. Instale as dependências:
```bash
npm install
# ou
yarn install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```
Edite o arquivo `.env` com suas configurações.

4. Execute as migrações do banco de dados:
```bash
npm run migrate
# ou
yarn migrate
```

5. Execute os seeds do banco de dados:
```bash
npm run seed
# ou
yarn seed
```

## Desenvolvimento

Para iniciar o servidor em modo de desenvolvimento:
```bash
npm run dev
# ou
yarn dev
```

## Testes

Para executar os testes:
```bash
npm test
# ou
yarn test
```

Para executar os testes com cobertura:
```bash
npm run test:coverage
# ou
yarn test:coverage
```

## Build

Para gerar o build de produção:
```bash
npm run build
# ou
yarn build
```

## Produção

Para iniciar o servidor em modo de produção:
```bash
npm start
# ou
yarn start
```

## Estrutura do Projeto

```
.
├── src/
│   ├── config/         # Configurações
│   ├── controllers/    # Controladores
│   ├── middlewares/    # Middlewares
│   ├── models/         # Modelos
│   ├── routes/         # Rotas
│   ├── services/       # Serviços
│   ├── utils/          # Utilitários
│   ├── tests/          # Testes
│   └── app.ts          # Aplicação
├── .env.example        # Exemplo de variáveis de ambiente
├── .gitignore         # Arquivos ignorados pelo git
├── package.json       # Dependências e scripts
├── tsconfig.json      # Configuração do TypeScript
└── README.md         # Este arquivo
```

## Funcionalidades

- [x] Autenticação de usuários
- [x] Registro de ponto
- [x] Gerenciamento de empresas
- [x] Gerenciamento de departamentos
- [x] Gerenciamento de usuários
- [x] Relatórios
- [x] Auditoria
- [x] Notificações

## Licença

Este projeto está licenciado sob a licença MIT - consulte o arquivo [LICENSE](LICENSE) para obter detalhes. 