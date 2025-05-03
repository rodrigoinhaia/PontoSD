import request from 'supertest';
import { app } from '../../app';
import { createTestUser, createTestCompany, createTestDepartment, createTestSchedule, createTestPoint } from '../setup';
import { RegistroPonto } from '../../models/registroPonto.model';
import { logger } from '../../utils/logger';

jest.mock('../../utils/logger');

describe('Points Integration Tests', () => {
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

  describe('GET /points', () => {
    it('should list all points for admin', async () => {
      await createTestPoint({ userId: user.id });
      await createTestPoint({ userId: user.id, type: 'exit' });

      const response = await request(app)
        .get('/points')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    });

    it('should list only user points for regular user', async () => {
      const otherUser = await createTestUser({ role: 'user' });
      await createTestPoint({ userId: user.id });
      await createTestPoint({ userId: otherUser.id });

      const response = await request(app)
        .get('/points')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].userId).toBe(user.id);
    });

    it('should handle pagination', async () => {
      for (let i = 0; i < 15; i++) {
        await createTestPoint({ 
          userId: user.id, 
          type: i % 2 === 0 ? 'entry' : 'exit' 
        });
      }

      const response = await request(app)
        .get('/points?page=2&limit=10')
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
        createdAt: today 
      });

      const response = await request(app)
        .get('/points')
        .query({
          startDate: yesterday.toISOString(),
          endDate: today.toISOString(),
        })
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    });
  });

  describe('GET /points/:id', () => {
    it('should get point by id for admin', async () => {
      const point = await createTestPoint({ userId: user.id });

      const response = await request(app)
        .get(`/points/${point.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(point.id);
      expect(response.body.type).toBe(point.type);
    });

    it('should get own point for regular user', async () => {
      const point = await createTestPoint({ userId: user.id });

      const response = await request(app)
        .get(`/points/${point.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(point.id);
    });

    it('should not get other user point for regular user', async () => {
      const otherUser = await createTestUser({ role: 'user' });
      const point = await createTestPoint({ userId: otherUser.id });

      const response = await request(app)
        .get(`/points/${point.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Acesso negado');
    });

    it('should handle non-existent point', async () => {
      const response = await request(app)
        .get('/points/999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Ponto não encontrado');
    });
  });

  describe('POST /points', () => {
    it('should create point for user', async () => {
      const pointData = {
        type: 'entry',
        address: 'Test Address',
      };

      const response = await request(app)
        .post('/points')
        .set('Authorization', `Bearer ${userToken}`)
        .send(pointData);

      expect(response.status).toBe(201);
      expect(response.body.type).toBe(pointData.type);
      expect(response.body.address).toBe(pointData.address);
      expect(response.body.userId).toBe(user.id);

      const point = await RegistroPonto.findByPk(response.body.id);
      expect(point).not.toBeNull();
      expect(point?.type).toBe(pointData.type);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/points')
        .set('Authorization', `Bearer ${userToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Tipo é obrigatório');
    });

    it('should validate point type', async () => {
      const response = await request(app)
        .post('/points')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          type: 'invalid',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Tipo inválido');
    });

    it('should prevent double entry', async () => {
      await createTestPoint({ userId: user.id, type: 'entry' });

      const response = await request(app)
        .post('/points')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          type: 'entry',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Já existe um ponto de entrada hoje');
    });

    it('should prevent exit without entry', async () => {
      const response = await request(app)
        .post('/points')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          type: 'exit',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Não existe ponto de entrada hoje');
    });
  });

  describe('PUT /points/:id', () => {
    it('should update point for admin', async () => {
      const point = await createTestPoint({ userId: user.id });
      const updateData = {
        type: 'exit',
        address: 'Updated Address',
      };

      const response = await request(app)
        .put(`/points/${point.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.type).toBe(updateData.type);
      expect(response.body.address).toBe(updateData.address);

      const updatedPoint = await RegistroPonto.findByPk(point.id);
      expect(updatedPoint?.type).toBe(updateData.type);
      expect(updatedPoint?.address).toBe(updateData.address);
    });

    it('should not update point for regular user', async () => {
      const point = await createTestPoint({ userId: user.id });

      const response = await request(app)
        .put(`/points/${point.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          address: 'Updated Address',
        });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Acesso negado');
    });

    it('should handle non-existent point', async () => {
      const response = await request(app)
        .put('/points/999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          address: 'Updated Address',
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Ponto não encontrado');
    });
  });

  describe('DELETE /points/:id', () => {
    it('should delete point for admin', async () => {
      const point = await createTestPoint({ userId: user.id });

      const response = await request(app)
        .delete(`/points/${point.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(204);

      const deletedPoint = await RegistroPonto.findByPk(point.id);
      expect(deletedPoint).toBeNull();
    });

    it('should not delete point for regular user', async () => {
      const point = await createTestPoint({ userId: user.id });

      const response = await request(app)
        .delete(`/points/${point.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Acesso negado');

      const existingPoint = await RegistroPonto.findByPk(point.id);
      expect(existingPoint).not.toBeNull();
    });

    it('should handle non-existent point', async () => {
      const response = await request(app)
        .delete('/points/999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Ponto não encontrado');
    });
  });
}); 