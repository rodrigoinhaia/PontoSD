import { Company, Department, User, Schedule } from '../models';
import { logger } from '../utils/logger';
import bcrypt from 'bcryptjs';

export const seedDatabase = async (): Promise<void> => {
  try {
    // Verifica se já existem dados no banco
    const companyCount = await Company.count();
    if (companyCount > 0) {
      logger.info('Database already seeded');
      return;
    }

    // Cria uma empresa
    const company = await Company.create({
      name: 'Empresa Teste',
      cnpj: '12345678000190',
      address: 'Rua Teste, 123',
      phone: '(11) 99999-9999',
      email: 'contato@empresateste.com',
      active: true,
    });

    // Cria um departamento
    const department = await Department.create({
      companyId: company.id,
      name: 'TI',
      description: 'Departamento de Tecnologia da Informação',
      active: true,
    });

    // Cria um usuário admin
    const hashedPassword = await bcrypt.hash('123456', 10);
    const admin = await User.create({
      companyId: company.id,
      departmentId: department.id,
      name: 'Admin',
      email: 'admin@empresateste.com',
      password: hashedPassword,
      role: 'admin',
      active: true,
    });

    // Cria um usuário comum
    const user = await User.create({
      companyId: company.id,
      departmentId: department.id,
      name: 'Usuário Teste',
      email: 'usuario@empresateste.com',
      password: hashedPassword,
      role: 'user',
      active: true,
    });

    // Cria horários para o usuário
    const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    for (const day of daysOfWeek) {
      await Schedule.create({
        userId: user.id,
        dayOfWeek: day,
        startTime: '09:00',
        endTime: '18:00',
        breakStartTime: '12:00',
        breakEndTime: '13:00',
        active: true,
      });
    }

    logger.info('Database seeded successfully');
  } catch (error) {
    logger.error('Error seeding database:', error);
    throw error;
  }
}; 