import request from 'supertest';
import { app } from '../../app';
import { createTestUser, createTestCompany, createTestDepartment, createTestSchedule, createTestPoint } from '../setup';
import { Relatorio } from '../../models/relatorio.model';
import { User } from '../../models/user.model';
import { RegistroPonto } from '../../models/registroPonto.model';
import { logger } from '../../utils/logger';

jest.mock('../../utils/logger');

describe('Reports Integration Tests', () => {
  let adminToken: string;
  let userToken: string;
  let company: any;
  let department: any;
  let schedule: any;
  let user: any;

  beforeEach(async () => {
    const admin = await createTestUser({ role: 'admin' });
    user = await createTestUser({ role: 'user' });
    company = await createTestCompany();
    department = await createTestDepartment({ companyId: company.id });
    schedule = await createTestSchedule({ departmentId: department.id });

    const adminLogin = await request(app)
      .post('/auth/login')
      .send({
        email: admin.email,
        password: 'password123',
      });

    const userLogin = await request(app)
      .post('/auth/login')
      .send({
        email: user.email,
        password: 'password123',
      });

    adminToken = adminLogin.body.token;
    userToken = userLogin.body.token;
  });

  describe('GET /reports', () => {
    it('should list all reports for admin', async () => {
      await createTestPoint({ userId: user.id });
      await createTestPoint({ userId: user.id, type: 'exit' });

      const response = await request(app)
        .get('/reports')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toHaveProperty('userId');
      expect(response.body[0]).toHaveProperty('date');
      expect(response.body[0]).toHaveProperty('hoursWorked');
    });

    it('should list only user reports for regular user', async () => {
      const otherUser = await createTestUser({ role: 'user' });
      await createTestPoint({ userId: user.id });
      await createTestPoint({ userId: user.id, type: 'exit' });
      await createTestPoint({ userId: otherUser.id });
      await createTestPoint({ userId: otherUser.id, type: 'exit' });

      const response = await request(app)
        .get('/reports')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].userId).toBe(user.id);
    });

    it('should handle pagination', async () => {
      for (let i = 0; i < 15; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        await createTestPoint({ 
          userId: user.id, 
          createdAt: date 
        });
        await createTestPoint({ 
          userId: user.id, 
          type: 'exit', 
          createdAt: date 
        });
      }

      const response = await request(app)
        .get('/reports?page=2&limit=10')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(5);
    });

    it('should filter by date range', async () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      await createTestPoint({ 
        userId: user.id, 
        createdAt: yesterday 
      });
      await createTestPoint({ 
        userId: user.id, 
        type: 'exit', 
        createdAt: yesterday 
      });
      await createTestPoint({ 
        userId: user.id, 
        createdAt: today 
      });
      await createTestPoint({ 
        userId: user.id, 
        type: 'exit', 
        createdAt: today 
      });

      const response = await request(app)
        .get('/reports')
        .query({
          startDate: yesterday.toISOString(),
          endDate: today.toISOString(),
        })
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    });

    it('should filter by user', async () => {
      const otherUser = await createTestUser({ role: 'user' });
      await createTestPoint(user.id);
      await createTestPoint(user.id, { type: 'exit' });
      await createTestPoint(otherUser.id);
      await createTestPoint(otherUser.id, { type: 'exit' });

      const response = await request(app)
        .get('/reports')
        .query({
          userId: otherUser.id,
        })
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].userId).toBe(otherUser.id);
    });
  });

  describe('GET /reports/:id', () => {
    it('should get report by id for admin', async () => {
      await createTestPoint(user.id);
      await createTestPoint(user.id, { type: 'exit' });

      const reports = await request(app)
        .get('/reports')
        .set('Authorization', `Bearer ${adminToken}`);

      const reportId = reports.body[0].id;

      const response = await request(app)
        .get(`/reports/${reportId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(reportId);
      expect(response.body).toHaveProperty('userId');
      expect(response.body).toHaveProperty('date');
      expect(response.body).toHaveProperty('hoursWorked');
    });

    it('should get own report for regular user', async () => {
      await createTestPoint(user.id);
      await createTestPoint(user.id, { type: 'exit' });

      const reports = await request(app)
        .get('/reports')
        .set('Authorization', `Bearer ${userToken}`);

      const reportId = reports.body[0].id;

      const response = await request(app)
        .get(`/reports/${reportId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(reportId);
    });

    it('should not get other user report for regular user', async () => {
      const otherUser = await createTestUser({ role: 'user' });
      await createTestPoint(otherUser.id);
      await createTestPoint(otherUser.id, { type: 'exit' });

      const reports = await request(app)
        .get('/reports')
        .set('Authorization', `Bearer ${adminToken}`);

      const reportId = reports.body[0].id;

      const response = await request(app)
        .get(`/reports/${reportId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Acesso negado');
    });

    it('should handle non-existent report', async () => {
      const response = await request(app)
        .get('/reports/999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Relatório não encontrado');
    });
  });

  describe('POST /reports/generate', () => {
    it('should generate report for admin', async () => {
      await createTestPoint(user.id);
      await createTestPoint(user.id, { type: 'exit' });

      const response = await request(app)
        .post('/reports/generate')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          startDate: new Date().toISOString(),
          endDate: new Date().toISOString(),
          userId: user.id,
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('userId');
      expect(response.body).toHaveProperty('date');
      expect(response.body).toHaveProperty('hoursWorked');
    });

    it('should generate own report for regular user', async () => {
      await createTestPoint(user.id);
      await createTestPoint(user.id, { type: 'exit' });

      const response = await request(app)
        .post('/reports/generate')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          startDate: new Date().toISOString(),
          endDate: new Date().toISOString(),
        });

      expect(response.status).toBe(200);
      expect(response.body.userId).toBe(user.id);
    });

    it('should not generate other user report for regular user', async () => {
      const otherUser = await createTestUser({ role: 'user' });

      const response = await request(app)
        .post('/reports/generate')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          startDate: new Date().toISOString(),
          endDate: new Date().toISOString(),
          userId: otherUser.id,
        });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Acesso negado');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/reports/generate')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Data inicial é obrigatória');
      expect(response.body.message).toContain('Data final é obrigatória');
    });

    it('should validate date range', async () => {
      const response = await request(app)
        .post('/reports/generate')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() - 86400000).toISOString(),
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Data final deve ser após a data inicial');
    });
  });

  describe('GET /reports/daily', () => {
    it('should generate daily report for admin', async () => {
      const date = new Date('2024-01-01');
      await Point.create({
        userId: user.id,
        type: 'entry',
        timestamp: date,
      });

      await Point.create({
        userId: user.id,
        type: 'exit',
        timestamp: new Date(date.getTime() + 8 * 60 * 60 * 1000),
      });

      const response = await request(app)
        .get('/reports/daily')
        .query({
          date: date.toISOString(),
        })
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].userId).toBe(user.id);
      expect(response.body[0].date).toBe(date.toISOString().split('T')[0]);
      expect(response.body[0].workedHours).toBe(8);
      expect(response.body[0].points).toHaveLength(2);
    });

    it('should generate own daily report for regular user', async () => {
      const date = new Date('2024-01-01');
      await Point.create({
        userId: user.id,
        type: 'entry',
        timestamp: date,
      });

      const otherUser = await createTestUser();
      await Point.create({
        userId: otherUser.id,
        type: 'entry',
        timestamp: date,
      });

      const response = await request(app)
        .get('/reports/daily')
        .query({
          date: date.toISOString(),
        })
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].userId).toBe(user.id);
    });

    it('should filter by user', async () => {
      const date = new Date('2024-01-01');
      const otherUser = await createTestUser();

      await Point.create({
        userId: user.id,
        type: 'entry',
        timestamp: date,
      });

      await Point.create({
        userId: otherUser.id,
        type: 'entry',
        timestamp: date,
      });

      const response = await request(app)
        .get('/reports/daily')
        .query({
          date: date.toISOString(),
          userId: otherUser.id,
        })
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].userId).toBe(otherUser.id);
    });

    it('should validate date format', async () => {
      const response = await request(app)
        .get('/reports/daily')
        .query({
          date: 'invalid',
        })
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Data inválida');
    });

    it('should validate user exists', async () => {
      const response = await request(app)
        .get('/reports/daily')
        .query({
          date: new Date().toISOString(),
          userId: 999,
        })
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Usuário não encontrado');
    });
  });

  describe('GET /reports/monthly', () => {
    it('should generate monthly report for admin', async () => {
      const month = '2024-01';
      const date = new Date(month);

      await Point.create({
        userId: user.id,
        type: 'entry',
        timestamp: date,
      });

      await Point.create({
        userId: user.id,
        type: 'exit',
        timestamp: new Date(date.getTime() + 8 * 60 * 60 * 1000),
      });

      const response = await request(app)
        .get('/reports/monthly')
        .query({
          month,
        })
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].userId).toBe(user.id);
      expect(response.body[0].month).toBe(month);
      expect(response.body[0].totalWorkedHours).toBe(8);
      expect(response.body[0].days).toHaveLength(1);
    });

    it('should generate own monthly report for regular user', async () => {
      const month = '2024-01';
      const date = new Date(month);

      await Point.create({
        userId: user.id,
        type: 'entry',
        timestamp: date,
      });

      const otherUser = await createTestUser();
      await Point.create({
        userId: otherUser.id,
        type: 'entry',
        timestamp: date,
      });

      const response = await request(app)
        .get('/reports/monthly')
        .query({
          month,
        })
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].userId).toBe(user.id);
    });

    it('should filter by user', async () => {
      const month = '2024-01';
      const date = new Date(month);
      const otherUser = await createTestUser();

      await Point.create({
        userId: user.id,
        type: 'entry',
        timestamp: date,
      });

      await Point.create({
        userId: otherUser.id,
        type: 'entry',
        timestamp: date,
      });

      const response = await request(app)
        .get('/reports/monthly')
        .query({
          month,
          userId: otherUser.id,
        })
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].userId).toBe(otherUser.id);
    });

    it('should validate month format', async () => {
      const response = await request(app)
        .get('/reports/monthly')
        .query({
          month: 'invalid',
        })
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Mês inválido');
    });

    it('should validate user exists', async () => {
      const response = await request(app)
        .get('/reports/monthly')
        .query({
          month: '2024-01',
          userId: 999,
        })
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Usuário não encontrado');
    });
  });

  describe('GET /reports/yearly', () => {
    it('should generate yearly report for admin', async () => {
      const year = '2024';
      const date = new Date(year);

      await Point.create({
        userId: user.id,
        type: 'entry',
        timestamp: date,
      });

      await Point.create({
        userId: user.id,
        type: 'exit',
        timestamp: new Date(date.getTime() + 8 * 60 * 60 * 1000),
      });

      const response = await request(app)
        .get('/reports/yearly')
        .query({
          year,
        })
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].userId).toBe(user.id);
      expect(response.body[0].year).toBe(parseInt(year));
      expect(response.body[0].totalWorkedHours).toBe(8);
      expect(response.body[0].months).toHaveLength(1);
    });

    it('should generate own yearly report for regular user', async () => {
      const year = '2024';
      const date = new Date(year);

      await Point.create({
        userId: user.id,
        type: 'entry',
        timestamp: date,
      });

      const otherUser = await createTestUser();
      await Point.create({
        userId: otherUser.id,
        type: 'entry',
        timestamp: date,
      });

      const response = await request(app)
        .get('/reports/yearly')
        .query({
          year,
        })
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].userId).toBe(user.id);
    });

    it('should filter by user', async () => {
      const year = '2024';
      const date = new Date(year);
      const otherUser = await createTestUser();

      await Point.create({
        userId: user.id,
        type: 'entry',
        timestamp: date,
      });

      await Point.create({
        userId: otherUser.id,
        type: 'entry',
        timestamp: date,
      });

      const response = await request(app)
        .get('/reports/yearly')
        .query({
          year,
          userId: otherUser.id,
        })
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].userId).toBe(otherUser.id);
    });

    it('should validate year format', async () => {
      const response = await request(app)
        .get('/reports/yearly')
        .query({
          year: 'invalid',
        })
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Ano inválido');
    });

    it('should validate user exists', async () => {
      const response = await request(app)
        .get('/reports/yearly')
        .query({
          year: '2024',
          userId: 999,
        })
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Usuário não encontrado');
    });
  });
}); 