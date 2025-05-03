import request from 'supertest';
import { app } from '../../app';
import { createTestUser, createTestCompany, createTestDepartment, createTestSchedule } from '../setup';
import { Schedule } from '../../models/schedule.model';
import { logger } from '../../utils/logger';

jest.mock('../../utils/logger');

describe('Schedules Integration Tests', () => {
  let adminToken: string;
  let userToken: string;
  let company: any;
  let department: any;
  let user: any;

  beforeEach(async () => {
    const admin = await createTestUser({ role: 'admin' });
    user = await createTestUser({ role: 'user' });
    company = await createTestCompany();
    department = await createTestDepartment(company.id);

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

  describe('GET /schedules', () => {
    it('should list all schedules for admin', async () => {
      await createTestSchedule(department.id);
      await createTestSchedule(department.id);

      const response = await request(app)
        .get('/schedules')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('departmentId');
      expect(response.body[0]).toHaveProperty('startTime');
      expect(response.body[0]).toHaveProperty('endTime');
    });

    it('should list schedules for regular user', async () => {
      await createTestSchedule(department.id);
      await createTestSchedule(department.id);

      const response = await request(app)
        .get('/schedules')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    });

    it('should handle pagination', async () => {
      for (let i = 0; i < 15; i++) {
        await createTestSchedule(department.id);
      }

      const response = await request(app)
        .get('/schedules?page=2&limit=10')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(5);
    });

    it('should filter by department', async () => {
      const otherDepartment = await createTestDepartment(company.id);
      await createTestSchedule(department.id);
      await createTestSchedule(otherDepartment.id);

      const response = await request(app)
        .get('/schedules')
        .query({
          departmentId: otherDepartment.id,
        })
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].departmentId).toBe(otherDepartment.id);
    });
  });

  describe('GET /schedules/:id', () => {
    it('should get schedule by id for admin', async () => {
      const schedule = await createTestSchedule(department.id);

      const response = await request(app)
        .get(`/schedules/${schedule.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(schedule.id);
      expect(response.body).toHaveProperty('departmentId');
      expect(response.body).toHaveProperty('startTime');
      expect(response.body).toHaveProperty('endTime');
    });

    it('should get schedule for regular user', async () => {
      const schedule = await createTestSchedule(department.id);

      const response = await request(app)
        .get(`/schedules/${schedule.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(schedule.id);
    });

    it('should handle non-existent schedule', async () => {
      const response = await request(app)
        .get('/schedules/999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Horário não encontrado');
    });
  });

  describe('POST /schedules', () => {
    it('should create schedule for admin', async () => {
      const scheduleData = {
        departmentId: department.id,
        startTime: '09:00',
        endTime: '18:00',
        daysOfWeek: [1, 2, 3, 4, 5],
      };

      const response = await request(app)
        .post('/schedules')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(scheduleData);

      expect(response.status).toBe(201);
      expect(response.body.departmentId).toBe(scheduleData.departmentId);
      expect(response.body.startTime).toBe(scheduleData.startTime);
      expect(response.body.endTime).toBe(scheduleData.endTime);
      expect(response.body.daysOfWeek).toEqual(scheduleData.daysOfWeek);

      const schedule = await Schedule.findByPk(response.body.id);
      expect(schedule).not.toBeNull();
      expect(schedule?.departmentId).toBe(scheduleData.departmentId);
    });

    it('should not create schedule for regular user', async () => {
      const scheduleData = {
        departmentId: department.id,
        startTime: '09:00',
        endTime: '18:00',
        daysOfWeek: [1, 2, 3, 4, 5],
      };

      const response = await request(app)
        .post('/schedules')
        .set('Authorization', `Bearer ${userToken}`)
        .send(scheduleData);

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Acesso negado');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/schedules')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Departamento é obrigatório');
      expect(response.body.message).toContain('Horário de início é obrigatório');
      expect(response.body.message).toContain('Horário de término é obrigatório');
      expect(response.body.message).toContain('Dias da semana são obrigatórios');
    });

    it('should validate time format', async () => {
      const response = await request(app)
        .post('/schedules')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          departmentId: department.id,
          startTime: 'invalid',
          endTime: 'invalid',
          daysOfWeek: [1, 2, 3, 4, 5],
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Horário de início inválido');
      expect(response.body.message).toContain('Horário de término inválido');
    });

    it('should validate days of week', async () => {
      const response = await request(app)
        .post('/schedules')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          departmentId: department.id,
          startTime: '09:00',
          endTime: '18:00',
          daysOfWeek: [0, 8],
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Dias da semana inválidos');
    });
  });

  describe('PUT /schedules/:id', () => {
    it('should update schedule for admin', async () => {
      const schedule = await createTestSchedule(department.id);
      const updateData = {
        startTime: '10:00',
        endTime: '19:00',
        daysOfWeek: [2, 3, 4, 5, 6],
      };

      const response = await request(app)
        .put(`/schedules/${schedule.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.startTime).toBe(updateData.startTime);
      expect(response.body.endTime).toBe(updateData.endTime);
      expect(response.body.daysOfWeek).toEqual(updateData.daysOfWeek);

      const updatedSchedule = await Schedule.findByPk(schedule.id);
      expect(updatedSchedule?.startTime).toBe(updateData.startTime);
      expect(updatedSchedule?.endTime).toBe(updateData.endTime);
      expect(updatedSchedule?.daysOfWeek).toEqual(updateData.daysOfWeek);
    });

    it('should not update schedule for regular user', async () => {
      const schedule = await createTestSchedule(department.id);

      const response = await request(app)
        .put(`/schedules/${schedule.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          startTime: '10:00',
        });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Acesso negado');
    });

    it('should handle non-existent schedule', async () => {
      const response = await request(app)
        .put('/schedules/999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          startTime: '10:00',
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Horário não encontrado');
    });
  });

  describe('DELETE /schedules/:id', () => {
    it('should delete schedule for admin', async () => {
      const schedule = await createTestSchedule(department.id);

      const response = await request(app)
        .delete(`/schedules/${schedule.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(204);

      const deletedSchedule = await Schedule.findByPk(schedule.id);
      expect(deletedSchedule).toBeNull();
    });

    it('should not delete schedule for regular user', async () => {
      const schedule = await createTestSchedule(department.id);

      const response = await request(app)
        .delete(`/schedules/${schedule.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Acesso negado');

      const existingSchedule = await Schedule.findByPk(schedule.id);
      expect(existingSchedule).not.toBeNull();
    });

    it('should handle non-existent schedule', async () => {
      const response = await request(app)
        .delete('/schedules/999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Horário não encontrado');
    });
  });
}); 