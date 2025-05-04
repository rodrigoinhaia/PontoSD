import { execSync } from 'child_process';
import dotenv from 'dotenv';
import { sequelize } from '../config/database';
import { Auditoria } from '../models/auditoria.model';
import { Departamento } from '../models/departamento.model';
import { Empresa } from '../models/empresa.model';
import { RegistroPonto } from '../models/registroPonto.model';
import { Relatorio } from '../models/relatorio.model';
import { Schedule } from '../models/schedule.model';
import { User } from '../models/user.model';
import { createTestDatabase, dropTestDatabase } from './config/test.config';
import { hashPassword } from '../utils/auth';
import { setupRelationships } from '../models/relationships';

// Carrega as variáveis de ambiente
dotenv.config({ path: '.env.test' });

// Configura os relacionamentos entre os modelos
setupRelationships();

// Executa as migrações do banco de dados de teste
execSync('npx sequelize-cli db:migrate --env test');

// Executa os seeds do banco de dados de teste
execSync('npx sequelize-cli db:seed:all --env test');

beforeAll(async () => {
  await createTestDatabase();
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
  await dropTestDatabase();
});

beforeEach(async () => {
  await User.destroy({ where: {} });
  await Empresa.destroy({ where: {} });
  await Departamento.destroy({ where: {} });
  await Schedule.destroy({ where: {} });
  await RegistroPonto.destroy({ where: {} });
  await Relatorio.destroy({ where: {} });
  await Auditoria.destroy({ where: {} });
});

interface TestUserOptions {
  name?: string;
  email?: string;
  password?: string;
  role?: 'admin' | 'user';
  companyId?: number;
  departmentId?: number;
}

interface TestCompanyOptions {
  name?: string;
  cnpj?: string;
}

interface TestDepartmentOptions {
  name?: string;
  companyId?: number;
}

interface TestScheduleOptions {
  name?: string;
  entryTime?: string;
  exitTime?: string;
  tolerance?: number;
  companyId?: number;
}

interface TestPointOptions {
  userId?: number;
  type?: 'entry' | 'exit';
  timestamp?: Date;
  createdAt?: Date;
}

export async function createTestUser(options: TestUserOptions = {}) {
  const user = await User.create({
    name: options.name || 'Test User',
    email: options.email || `test${Date.now()}@example.com`,
    password: await hashPassword(options.password || 'password123'),
    role: options.role || 'user',
    companyId: options.companyId,
    departmentId: options.departmentId,
  });

  return user;
}

export async function createTestCompany(options: TestCompanyOptions = {}) {
  const company = await Empresa.create({
    name: options.name || 'Test Company',
    cnpj: options.cnpj || `${Date.now()}`,
  });

  return company;
}

export async function createTestDepartment(options: TestDepartmentOptions = {}) {
  const department = await Departamento.create({
    name: options.name || 'Test Department',
    companyId: options.companyId,
  });

  return department;
}

export async function createTestSchedule(options: TestScheduleOptions = {}) {
  const schedule = await Schedule.create({
    name: options.name || 'Test Schedule',
    entryTime: options.entryTime || '09:00',
    exitTime: options.exitTime || '18:00',
    tolerance: options.tolerance || 15,
    companyId: options.companyId,
  });

  return schedule;
}

export async function createTestPoint(options: TestPointOptions = {}) {
  const point = await RegistroPonto.create({
    userId: options.userId,
    type: options.type || 'entry',
    timestamp: options.timestamp || new Date(),
    createdAt: options.createdAt || new Date(),
  });

  return point;
} 