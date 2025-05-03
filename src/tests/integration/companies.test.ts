import request from 'supertest';
import { app } from '../../app';
import { createTestUser, createTestCompany } from '../setup';
import { Empresa } from '../../models/empresa.model';
import { logger } from '../../utils/logger';

jest.mock('../../utils/logger');

describe('Companies Integration Tests', () => {
  let adminToken: string;
  let userToken: string;
  let user: any;

  beforeEach(async () => {
    const admin = await createTestUser({ role: 'admin' });
    user = await createTestUser({ role: 'user' });

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

  describe('GET /companies', () => {
    it('should list all companies for admin', async () => {
      await createTestCompany();
      await createTestCompany();

      const response = await request(app)
        .get('/companies')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('cnpj');
      expect(response.body[0]).toHaveProperty('address');
    });

    it('should list companies for regular user', async () => {
      await createTestCompany();
      await createTestCompany();

      const response = await request(app)
        .get('/companies')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    });

    it('should handle pagination', async () => {
      for (let i = 0; i < 15; i++) {
        await createTestCompany();
      }

      const response = await request(app)
        .get('/companies?page=2&limit=10')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(5);
    });

    it('should filter by name', async () => {
      await createTestCompany({ name: 'Company A' });
      await createTestCompany({ name: 'Company B' });

      const response = await request(app)
        .get('/companies')
        .query({
          name: 'Company A',
        })
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].name).toBe('Company A');
    });
  });

  describe('GET /companies/:id', () => {
    it('should get company by id for admin', async () => {
      const company = await createTestCompany();

      const response = await request(app)
        .get(`/companies/${company.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(company.id);
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('cnpj');
      expect(response.body).toHaveProperty('address');
    });

    it('should get company for regular user', async () => {
      const company = await createTestCompany();

      const response = await request(app)
        .get(`/companies/${company.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(company.id);
    });

    it('should handle non-existent company', async () => {
      const response = await request(app)
        .get('/companies/999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Empresa não encontrada');
    });
  });

  describe('POST /companies', () => {
    it('should create company for admin', async () => {
      const companyData = {
        name: 'New Company',
        cnpj: '12345678901234',
        address: 'Company Address',
      };

      const response = await request(app)
        .post('/companies')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(companyData);

      expect(response.status).toBe(201);
      expect(response.body.name).toBe(companyData.name);
      expect(response.body.cnpj).toBe(companyData.cnpj);
      expect(response.body.address).toBe(companyData.address);

      const company = await Empresa.findByPk(response.body.id);
      expect(company).not.toBeNull();
      expect(company?.name).toBe(companyData.name);
    });

    it('should not create company for regular user', async () => {
      const companyData = {
        name: 'New Company',
        cnpj: '12345678901234',
        address: 'Company Address',
      };

      const response = await request(app)
        .post('/companies')
        .set('Authorization', `Bearer ${userToken}`)
        .send(companyData);

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Acesso negado');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/companies')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Nome é obrigatório');
      expect(response.body.message).toContain('CNPJ é obrigatório');
    });

    it('should validate CNPJ format', async () => {
      const response = await request(app)
        .post('/companies')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'New Company',
          cnpj: 'invalid',
          address: 'Company Address',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('CNPJ inválido');
    });

    it('should validate unique CNPJ', async () => {
      const companyData = {
        name: 'New Company',
        cnpj: '12345678901234',
        address: 'Company Address',
      };

      await request(app)
        .post('/companies')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(companyData);

      const response = await request(app)
        .post('/companies')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(companyData);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('CNPJ já cadastrado');
    });
  });

  describe('PUT /companies/:id', () => {
    it('should update company for admin', async () => {
      const company = await createTestCompany();
      const updateData = {
        name: 'Updated Company',
        address: 'Updated Address',
      };

      const response = await request(app)
        .put(`/companies/${company.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.name).toBe(updateData.name);
      expect(response.body.address).toBe(updateData.address);

      const updatedCompany = await Empresa.findByPk(company.id);
      expect(updatedCompany?.name).toBe(updateData.name);
      expect(updatedCompany?.address).toBe(updateData.address);
    });

    it('should not update company for regular user', async () => {
      const company = await createTestCompany();

      const response = await request(app)
        .put(`/companies/${company.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Updated Company',
        });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Acesso negado');
    });

    it('should handle non-existent company', async () => {
      const response = await request(app)
        .put('/companies/999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Updated Company',
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Empresa não encontrada');
    });

    it('should validate CNPJ format on update', async () => {
      const company = await createTestCompany();

      const response = await request(app)
        .put(`/companies/${company.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          cnpj: 'invalid',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('CNPJ inválido');
    });

    it('should validate unique CNPJ on update', async () => {
      const company1 = await createTestCompany({ cnpj: '12345678901234' });
      const company2 = await createTestCompany({ cnpj: '98765432109876' });

      const response = await request(app)
        .put(`/companies/${company2.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          cnpj: company1.cnpj,
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('CNPJ já cadastrado');
    });
  });

  describe('DELETE /companies/:id', () => {
    it('should delete company for admin', async () => {
      const company = await createTestCompany();

      const response = await request(app)
        .delete(`/companies/${company.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(204);

      const deletedCompany = await Empresa.findByPk(company.id);
      expect(deletedCompany).toBeNull();
    });

    it('should not delete company for regular user', async () => {
      const company = await createTestCompany();

      const response = await request(app)
        .delete(`/companies/${company.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Acesso negado');

      const existingCompany = await Empresa.findByPk(company.id);
      expect(existingCompany).not.toBeNull();
    });

    it('should handle non-existent company', async () => {
      const response = await request(app)
        .delete('/companies/999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Empresa não encontrada');
    });
  });
}); 