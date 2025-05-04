import { sequelize } from '../config/database';
import { logger } from '../utils/logger';

// Desativa logs durante os testes
logger.silent = true;

// Configura o ambiente de teste
process.env.NODE_ENV = 'test';

// Função para limpar o banco de dados antes de cada teste
export const clearDatabase = async (): Promise<void> => {
  const models = Object.values(sequelize.models);
  
  // Desativa as chaves estrangeiras temporariamente
  await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
  
  // Limpa todas as tabelas
  for (const model of models) {
    await model.destroy({ where: {}, force: true });
  }
  
  // Reativa as chaves estrangeiras
  await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
};

// Função para criar dados de teste
export const createTestData = async (): Promise<void> => {
  // Implemente a criação de dados de teste aqui
};

// Configura o ambiente antes de todos os testes
beforeAll(async () => {
  // Conecta ao banco de dados de teste
  await sequelize.authenticate();
  
  // Sincroniza os modelos com o banco de dados
  await sequelize.sync({ force: true });
});

// Limpa o banco de dados antes de cada teste
beforeEach(async () => {
  await clearDatabase();
});

// Fecha a conexão com o banco de dados após todos os testes
afterAll(async () => {
  await sequelize.close();
}); 