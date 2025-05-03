import { Sequelize } from 'sequelize';
import { config } from '../../config/config';

export const testConfig = {
  ...config,
  database: {
    ...config.database,
    database: 'ponto_sd_test',
  },
};

export const createTestDatabase = async () => {
  const sequelize = new Sequelize({
    dialect: 'postgres',
    host: testConfig.database.host,
    port: testConfig.database.port,
    username: testConfig.database.username,
    password: testConfig.database.password,
    database: 'postgres',
  });

  try {
    await sequelize.query(`DROP DATABASE IF EXISTS ${testConfig.database.database}`);
    await sequelize.query(`CREATE DATABASE ${testConfig.database.database}`);
  } catch (error) {
    console.error('Erro ao criar banco de dados de teste:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
};

export const dropTestDatabase = async () => {
  const sequelize = new Sequelize({
    dialect: 'postgres',
    host: testConfig.database.host,
    port: testConfig.database.port,
    username: testConfig.database.username,
    password: testConfig.database.password,
    database: 'postgres',
  });

  try {
    await sequelize.query(`DROP DATABASE IF EXISTS ${testConfig.database.database}`);
  } catch (error) {
    console.error('Erro ao remover banco de dados de teste:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}; 