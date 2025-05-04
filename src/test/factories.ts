import { faker } from '@faker-js/faker';
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

// Factory de usuário
export const userFactory = {
  build: (overrides = {}) => ({
    nome: faker.person.fullName(),
    email: faker.internet.email(),
    senha: faker.internet.password(),
    ativo: true,
    verificado: true,
    ...overrides,
  }),
  create: async (overrides = {}) => {
    const data = userFactory.build(overrides);
    return User.create(data);
  },
};

// Factory de empresa
export const empresaFactory = {
  build: (overrides = {}) => ({
    nome: faker.company.name(),
    cnpj: faker.string.numeric(14),
    razaoSocial: faker.company.name(),
    endereco: faker.location.streetAddress(),
    telefone: faker.phone.number(),
    email: faker.internet.email(),
    ativo: true,
    ...overrides,
  }),
  create: async (overrides = {}) => {
    const data = empresaFactory.build(overrides);
    return Empresa.create(data);
  },
};

// Factory de departamento
export const departamentoFactory = {
  build: (empresaId: number, overrides = {}) => ({
    nome: faker.commerce.department(),
    descricao: faker.lorem.sentence(),
    empresaId,
    ativo: true,
    ...overrides,
  }),
  create: async (empresaId: number, overrides = {}) => {
    const data = departamentoFactory.build(empresaId, overrides);
    return Departamento.create(data);
  },
};

// Factory de permissão
export const permissionFactory = {
  build: (overrides = {}) => ({
    nome: faker.helpers.unique(faker.word.sample),
    descricao: faker.lorem.sentence(),
    ativo: true,
    ...overrides,
  }),
  create: async (overrides = {}) => {
    const data = permissionFactory.build(overrides);
    return Permission.create(data);
  },
};

// Factory de papel
export const roleFactory = {
  build: (overrides = {}) => ({
    nome: faker.helpers.unique(faker.word.sample),
    descricao: faker.lorem.sentence(),
    ativo: true,
    ...overrides,
  }),
  create: async (overrides = {}) => {
    const data = roleFactory.build(overrides);
    return Role.create(data);
  },
};

// Factory de configuração
export const configuracaoFactory = {
  build: (empresaId: number, overrides = {}) => ({
    empresaId,
    toleranciaAtraso: faker.number.int({ min: 5, max: 30 }),
    toleranciaHoraExtra: faker.number.int({ min: 15, max: 60 }),
    horaInicioExpediente: '08:00',
    horaFimExpediente: '18:00',
    horaInicioAlmoco: '12:00',
    horaFimAlmoco: '13:00',
    permitirHoraExtra: faker.datatype.boolean(),
    permitirBancoHoras: faker.datatype.boolean(),
    ativo: true,
    ...overrides,
  }),
  create: async (empresaId: number, overrides = {}) => {
    const data = configuracaoFactory.build(empresaId, overrides);
    return Configuracao.create(data);
  },
};

// Factory de registro de ponto
export const registroPontoFactory = {
  build: (userId: number, overrides = {}) => ({
    userId,
    tipo: faker.helpers.arrayElement(['ENTRADA', 'SAIDA', 'INICIO_ALMOCO', 'FIM_ALMOCO']),
    data: faker.date.recent(),
    latitude: faker.location.latitude(),
    longitude: faker.location.longitude(),
    ip: faker.internet.ip(),
    dispositivo: faker.internet.userAgent(),
    observacao: faker.lorem.sentence(),
    ...overrides,
  }),
  create: async (userId: number, overrides = {}) => {
    const data = registroPontoFactory.build(userId, overrides);
    return RegistroPonto.create(data);
  },
};

// Factory de escala
export const scheduleFactory = {
  build: (userId: number, overrides = {}) => ({
    userId,
    diaSemana: faker.number.int({ min: 1, max: 7 }),
    horaInicio: '08:00',
    horaFim: '18:00',
    horaInicioAlmoco: '12:00',
    horaFimAlmoco: '13:00',
    ativo: true,
    ...overrides,
  }),
  create: async (userId: number, overrides = {}) => {
    const data = scheduleFactory.build(userId, overrides);
    return Schedule.create(data);
  },
};

// Factory de notificação
export const notificacaoFactory = {
  build: (userId: number, overrides = {}) => ({
    userId,
    tipo: faker.helpers.arrayElement(['INFO', 'WARNING', 'ERROR']),
    titulo: faker.lorem.sentence(),
    mensagem: faker.lorem.paragraph(),
    lida: faker.datatype.boolean(),
    ...overrides,
  }),
  create: async (userId: number, overrides = {}) => {
    const data = notificacaoFactory.build(userId, overrides);
    return Notificacao.create(data);
  },
};

// Factory de log
export const logFactory = {
  build: (userId: number, overrides = {}) => ({
    userId,
    tipo: faker.helpers.arrayElement(['INFO', 'WARNING', 'ERROR']),
    mensagem: faker.lorem.sentence(),
    ip: faker.internet.ip(),
    userAgent: faker.internet.userAgent(),
    ...overrides,
  }),
  create: async (userId: number, overrides = {}) => {
    const data = logFactory.build(userId, overrides);
    return Log.create(data);
  },
};

// Factory de auditoria
export const auditoriaFactory = {
  build: (userId: number, overrides = {}) => ({
    userId,
    entidade: faker.helpers.arrayElement(['User', 'Empresa', 'Departamento']),
    entidadeId: faker.number.int({ min: 1, max: 1000 }),
    acao: faker.helpers.arrayElement(['CREATE', 'UPDATE', 'DELETE']),
    valorAntigo: null,
    valorNovo: JSON.stringify({ id: faker.number.int(), nome: faker.person.fullName() }),
    ...overrides,
  }),
  create: async (userId: number, overrides = {}) => {
    const data = auditoriaFactory.build(userId, overrides);
    return Auditoria.create(data);
  },
};

// Factory de sessão
export const sessionFactory = {
  build: (userId: number, overrides = {}) => ({
    userId,
    token: faker.string.uuid(),
    ip: faker.internet.ip(),
    userAgent: faker.internet.userAgent(),
    expiresAt: faker.date.future(),
    ...overrides,
  }),
  create: async (userId: number, overrides = {}) => {
    const data = sessionFactory.build(userId, overrides);
    return Session.create(data);
  },
};

// Factory de token de usuário
export const userTokenFactory = {
  build: (userId: number, overrides = {}) => ({
    userId,
    tipo: faker.helpers.arrayElement(['REFRESH', 'RESET_PASSWORD', 'VERIFY_EMAIL']),
    token: faker.string.uuid(),
    expiresAt: faker.date.future(),
    ...overrides,
  }),
  create: async (userId: number, overrides = {}) => {
    const data = userTokenFactory.build(userId, overrides);
    return UserToken.create(data);
  },
};

// Factory de sessão de usuário
export const userSessionFactory = {
  build: (userId: number, overrides = {}) => ({
    userId,
    token: faker.string.uuid(),
    ip: faker.internet.ip(),
    userAgent: faker.internet.userAgent(),
    expiresAt: faker.date.future(),
    ...overrides,
  }),
  create: async (userId: number, overrides = {}) => {
    const data = userSessionFactory.build(userId, overrides);
    return UserSession.create(data);
  },
};

// Factory de associação usuário-papel
export const userRoleFactory = {
  build: (userId: number, roleId: number, overrides = {}) => ({
    userId,
    roleId,
    ...overrides,
  }),
  create: async (userId: number, roleId: number, overrides = {}) => {
    const data = userRoleFactory.build(userId, roleId, overrides);
    return UserRole.create(data);
  },
};

// Factory de associação papel-permissão
export const rolePermissionFactory = {
  build: (roleId: number, permissionId: number, overrides = {}) => ({
    roleId,
    permissionId,
    ...overrides,
  }),
  create: async (roleId: number, permissionId: number, overrides = {}) => {
    const data = rolePermissionFactory.build(roleId, permissionId, overrides);
    return RolePermission.create(data);
  },
};

// Factory de associação usuário-permissão
export const userPermissionFactory = {
  build: (userId: number, permissionId: number, overrides = {}) => ({
    userId,
    permissionId,
    ...overrides,
  }),
  create: async (userId: number, permissionId: number, overrides = {}) => {
    const data = userPermissionFactory.build(userId, permissionId, overrides);
    return UserPermission.create(data);
  },
}; 