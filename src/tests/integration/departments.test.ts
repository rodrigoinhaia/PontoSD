import request from 'supertest';
import { app } from '../../app';
import { createTestUser, createTestCompany, createTestDepartment } from '../setup';
import { Departamento } from '../../models/departamento.model';
import { logger } from '../../utils/logger';

jest.mock('../../utils/logger');

describe('Departments Integration Tests', () => {
  let adminToken: string;
  let userToken: string;
  let company: any;
  let user: any;

  beforeEach(async () => {
    const admin = await createTestUser({ role: 'admin' });
    user = await createTestUser({ role: 'user' });
    company = await createTestCompany();

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

  describe('GET /departments', () => {
    it('should list all departments for admin', async () => {
      await createTestDepartment(company.id);
      await createTestDepartment(company.id);

      const response = await request(app)
        .get('/departments')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('companyId');
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('description');
    });

    it('should list departments for regular user', async () => {
      await createTestDepartment(company.id);
      await createTestDepartment(company.id);

      const response = await request(app)
        .get('/departments')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    });

    it('should handle pagination', async () => {
      for (let i = 0; i < 15; i++) {
        await createTestDepartment(company.id);
      }

      const response = await request(app)
        .get('/departments?page=2&limit=10')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(5);
    });

    it('should filter by company', async () => {
      const otherCompany = await createTestCompany();
      await createTestDepartment(company.id);
      await createTestDepartment(otherCompany.id);

      const response = await request(app)
        .get('/departments')
        .query({
          companyId: otherCompany.id,
        })
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].companyId).toBe(otherCompany.id);
    });
  });

  describe('GET /departments/:id', () => {
    it('should get department by id for admin', async () => {
      const department = await createTestDepartment(company.id);

      const response = await request(app)
        .get(`/departments/${department.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(department.id);
      expect(response.body).toHaveProperty('companyId');
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('description');
    });

    it('should get department for regular user', async () => {
      const department = await createTestDepartment(company.id);

      const response = await request(app)
        .get(`/departments/${department.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(department.id);
    });

    it('should handle non-existent department', async () => {
      const response = await request(app)
        .get('/departments/999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Departamento não encontrado');
    });
  });

  describe('POST /departments', () => {
    it('should create department for admin', async () => {
      const departmentData = {
        companyId: company.id,
        name: 'New Department',
        description: 'Department Description',
      };

      const response = await request(app)
        .post('/departments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(departmentData);

      expect(response.status).toBe(201);
      expect(response.body.companyId).toBe(departmentData.companyId);
      expect(response.body.name).toBe(departmentData.name);
      expect(response.body.description).toBe(departmentData.description);

      const department = await Departamento.findByPk(response.body.id);
      expect(department).not.toBeNull();
      expect(department?.companyId).toBe(departmentData.companyId);
    });

    it('should not create department for regular user', async () => {
      const departmentData = {
        companyId: company.id,
        name: 'New Department',
        description: 'Department Description',
      };

      const response = await request(app)
        .post('/departments')
        .set('Authorization', `Bearer ${userToken}`)
        .send(departmentData);

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Acesso negado');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/departments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Empresa é obrigatória');
      expect(response.body.message).toContain('Nome é obrigatório');
    });

    it('should validate company exists', async () => {
      const response = await request(app)
        .post('/departments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          companyId: 999,
          name: 'New Department',
          description: 'Department Description',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Empresa não encontrada');
    });
  });

  describe('PUT /departments/:id', () => {
    it('should update department for admin', async () => {
      const department = await createTestDepartment(company.id);
      const updateData = {
        name: 'Updated Department',
        description: 'Updated Description',
      };

      const response = await request(app)
        .put(`/departments/${department.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.name).toBe(updateData.name);
      expect(response.body.description).toBe(updateData.description);

      const updatedDepartment = await Departamento.findByPk(department.id);
      expect(updatedDepartment?.name).toBe(updateData.name);
      expect(updatedDepartment?.description).toBe(updateData.description);
    });

    it('should not update department for regular user', async () => {
      const department = await createTestDepartment(company.id);

      const response = await request(app)
        .put(`/departments/${department.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Updated Department',
        });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Acesso negado');
    });

    it('should handle non-existent department', async () => {
      const response = await request(app)
        .put('/departments/999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Updated Department',
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Departamento não encontrado');
    });
  });

  describe('DELETE /departments/:id', () => {
    it('should delete department for admin', async () => {
      const department = await createTestDepartment(company.id);

      const response = await request(app)
        .delete(`/departments/${department.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(204);

      const deletedDepartment = await Departamento.findByPk(department.id);
      expect(deletedDepartment).toBeNull();
    });

    it('should not delete department for regular user', async () => {
      const department = await createTestDepartment(company.id);

      const response = await request(app)
        .delete(`/departments/${department.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Acesso negado');

      const existingDepartment = await Departamento.findByPk(department.id);
      expect(existingDepartment).not.toBeNull();
    });

    it('should handle non-existent department', async () => {
      const response = await request(app)
        .delete('/departments/999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Departamento não encontrado');
    });
  });
}); 