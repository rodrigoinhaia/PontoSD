import { sequelize } from '../config/database';
import { up } from '../migrations/20240101000000-create-tables';

async function migrate() {
  try {
    await up(sequelize.getQueryInterface());
    console.log('Migração concluída com sucesso');
    process.exit(0);
  } catch (error) {
    console.error('Erro na migração:', error);
    process.exit(1);
  }
}

migrate();