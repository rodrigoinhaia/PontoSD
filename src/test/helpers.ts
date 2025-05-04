import { User } from '../models/User';
import { Role } from '../models/Role';
import { Permission } from '../models/Permission';
import { UserRole } from '../models/UserRole';
import { RolePermission } from '../models/RolePermission';
import { UserPermission } from '../models/UserPermission';
import { UserSession } from '../models/UserSession';
import { UserToken } from '../models/UserToken';
import { Session } from '../models/Session';
import { Log } from '../models/Log';
import { Auditoria } from '../models/Auditoria';
import { Notificacao } from '../models/Notificacao';
import { Configuracao } from '../models/Configuracao';
import { Empresa } from '../models/Empresa';
import { Departamento } from '../models/Departamento';
import { Schedule } from '../models/Schedule';
import { RegistroPonto } from '../models/RegistroPonto';

// Função para criar um usuário de teste
export const createTestUser = async (overrides = {}): Promise<User> => {
  const defaultUser = {
    nome: 'Test User',
    email: 'test@example.com',
    senha: 'Test@123',
    ativo: true,
    verificado: true,
  };

  return User.create({ ...defaultUser, ...overrides });
};

// Função para criar uma empresa de teste
export const createTestEmpresa = async (overrides = {}): Promise<Empresa> => {
  const defaultEmpresa = {
    nome: 'Test Company',
    cnpj: '12345678901234',
    razaoSocial: 'Test Company LTDA',
    endereco: 'Test Street, 123',
    telefone: '1234567890',
    email: 'company@test.com',
    ativo: true,
  };

  return Empresa.create({ ...defaultEmpresa, ...overrides });
};

// Função para criar um departamento de teste
export const createTestDepartamento = async (empresaId: number, overrides = {}): Promise<Departamento> => {
  const defaultDepartamento = {
    nome: 'Test Department',
    descricao: 'Test Department Description',
    empresaId,
    ativo: true,
  };

  return Departamento.create({ ...defaultDepartamento, ...overrides });
};

// Função para criar uma permissão de teste
export const createTestPermission = async (overrides = {}): Promise<Permission> => {
  const defaultPermission = {
    nome: 'test_permission',
    descricao: 'Test Permission',
    ativo: true,
  };

  return Permission.create({ ...defaultPermission, ...overrides });
};

// Função para criar um papel de teste
export const createTestRole = async (overrides = {}): Promise<Role> => {
  const defaultRole = {
    nome: 'test_role',
    descricao: 'Test Role',
    ativo: true,
  };

  return Role.create({ ...defaultRole, ...overrides });
};

// Função para criar uma configuração de teste
export const createTestConfiguracao = async (empresaId: number, overrides = {}): Promise<Configuracao> => {
  const defaultConfiguracao = {
    empresaId,
    toleranciaAtraso: 15,
    toleranciaHoraExtra: 30,
    horaInicioExpediente: '08:00',
    horaFimExpediente: '18:00',
    horaInicioAlmoco: '12:00',
    horaFimAlmoco: '13:00',
    permitirHoraExtra: true,
    permitirBancoHoras: true,
    ativo: true,
  };

  return Configuracao.create({ ...defaultConfiguracao, ...overrides });
};

// Função para criar um registro de ponto de teste
export const createTestRegistroPonto = async (userId: number, overrides = {}): Promise<RegistroPonto> => {
  const defaultRegistroPonto = {
    userId,
    tipo: 'ENTRADA',
    data: new Date(),
    latitude: -23.550520,
    longitude: -46.633308,
    ip: '127.0.0.1',
    dispositivo: 'Test Device',
    observacao: 'Test observation',
  };

  return RegistroPonto.create({ ...defaultRegistroPonto, ...overrides });
};

// Função para criar uma escala de teste
export const createTestSchedule = async (userId: number, overrides = {}): Promise<Schedule> => {
  const defaultSchedule = {
    userId,
    diaSemana: 1,
    horaInicio: '08:00',
    horaFim: '18:00',
    horaInicioAlmoco: '12:00',
    horaFimAlmoco: '13:00',
    ativo: true,
  };

  return Schedule.create({ ...defaultSchedule, ...overrides });
};

// Função para criar uma notificação de teste
export const createTestNotificacao = async (userId: number, overrides = {}): Promise<Notificacao> => {
  const defaultNotificacao = {
    userId,
    tipo: 'INFO',
    titulo: 'Test Notification',
    mensagem: 'This is a test notification',
    lida: false,
  };

  return Notificacao.create({ ...defaultNotificacao, ...overrides });
};

// Função para criar um log de teste
export const createTestLog = async (userId: number, overrides = {}): Promise<Log> => {
  const defaultLog = {
    userId,
    tipo: 'INFO',
    mensagem: 'Test log message',
    ip: '127.0.0.1',
    userAgent: 'Test User Agent',
  };

  return Log.create({ ...defaultLog, ...overrides });
};

// Função para criar uma auditoria de teste
export const createTestAuditoria = async (userId: number, overrides = {}): Promise<Auditoria> => {
  const defaultAuditoria = {
    userId,
    entidade: 'User',
    entidadeId: 1,
    acao: 'CREATE',
    valorAntigo: null,
    valorNovo: JSON.stringify({ id: 1, nome: 'Test User' }),
  };

  return Auditoria.create({ ...defaultAuditoria, ...overrides });
};

// Função para criar uma sessão de teste
export const createTestSession = async (userId: number, overrides = {}): Promise<Session> => {
  const defaultSession = {
    userId,
    token: 'test_session_token',
    ip: '127.0.0.1',
    userAgent: 'Test User Agent',
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
  };

  return Session.create({ ...defaultSession, ...overrides });
};

// Função para criar um token de usuário de teste
export const createTestUserToken = async (userId: number, overrides = {}): Promise<UserToken> => {
  const defaultUserToken = {
    userId,
    tipo: 'REFRESH',
    token: 'test_refresh_token',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  };

  return UserToken.create({ ...defaultUserToken, ...overrides });
};

// Função para criar uma sessão de usuário de teste
export const createTestUserSession = async (userId: number, overrides = {}): Promise<UserSession> => {
  const defaultUserSession = {
    userId,
    token: 'test_user_session_token',
    ip: '127.0.0.1',
    userAgent: 'Test User Agent',
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
  };

  return UserSession.create({ ...defaultUserSession, ...overrides });
};

// Função para criar uma associação usuário-papel de teste
export const createTestUserRole = async (userId: number, roleId: number, overrides = {}): Promise<UserRole> => {
  const defaultUserRole = {
    userId,
    roleId,
  };

  return UserRole.create({ ...defaultUserRole, ...overrides });
};

// Função para criar uma associação papel-permissão de teste
export const createTestRolePermission = async (roleId: number, permissionId: number, overrides = {}): Promise<RolePermission> => {
  const defaultRolePermission = {
    roleId,
    permissionId,
  };

  return RolePermission.create({ ...defaultRolePermission, ...overrides });
};

// Função para criar uma associação usuário-permissão de teste
export const createTestUserPermission = async (userId: number, permissionId: number, overrides = {}): Promise<UserPermission> => {
  const defaultUserPermission = {
    userId,
    permissionId,
  };

  return UserPermission.create({ ...defaultUserPermission, ...overrides });
}; 