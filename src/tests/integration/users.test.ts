import request from 'supertest';
import { app } from '../../app';
import { createTestUser } from '../setup';
import { User } from '../../models/user.model';
import { logger } from '../../utils/logger';

jest.mock('../../utils/logger');

describe('Users Integration Tests', () => {
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

  describe('GET /users', () => {
    it('should list all users for admin', async () => {
      await createTestUser();
      await createTestUser();

      const response = await request(app)
        .get('/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(4); // Including admin and user from beforeEach
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('email');
      expect(response.body[0]).toHaveProperty('role');
    });

    it('should not list users for regular user', async () => {
      await createTestUser();
      await createTestUser();

      const response = await request(app)
        .get('/users')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Acesso negado');
    });

    it('should handle pagination', async () => {
      for (let i = 0; i < 15; i++) {
        await createTestUser();
      }

      const response = await request(app)
        .get('/users?page=2&limit=10')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(5);
    });

    it('should filter by role', async () => {
      await createTestUser({ role: 'admin' });
      await createTestUser({ role: 'user' });

      const response = await request(app)
        .get('/users')
        .query({
          role: 'admin',
        })
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2); // Including admin from beforeEach
      expect(response.body.every((u: any) => u.role === 'admin')).toBe(true);
    });
  });

  describe('GET /users/:id', () => {
    it('should get user by id for admin', async () => {
      const testUser = await createTestUser();

      const response = await request(app)
        .get(`/users/${testUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(testUser.id);
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('email');
      expect(response.body).toHaveProperty('role');
    });

    it('should get own user for regular user', async () => {
      const response = await request(app)
        .get(`/users/${user.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(user.id);
    });

    it('should not get other user for regular user', async () => {
      const otherUser = await createTestUser();

      const response = await request(app)
        .get(`/users/${otherUser.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Acesso negado');
    });

    it('should handle non-existent user', async () => {
      const response = await request(app)
        .get('/users/999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Usuário não encontrado');
    });
  });

  describe('POST /users', () => {
    it('should create user for admin', async () => {
      const userData = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'password123',
        role: 'user',
      };

      const response = await request(app)
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.name).toBe(userData.name);
      expect(response.body.email).toBe(userData.email);
      expect(response.body.role).toBe(userData.role);
      expect(response.body).not.toHaveProperty('password');

      const createdUser = await User.findByPk(response.body.id);
      expect(createdUser).not.toBeNull();
      expect(createdUser?.name).toBe(userData.name);
    });

    it('should not create user for regular user', async () => {
      const userData = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'password123',
        role: 'user',
      };

      const response = await request(app)
        .post('/users')
        .set('Authorization', `Bearer ${userToken}`)
        .send(userData);

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Acesso negado');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Nome é obrigatório');
      expect(response.body.message).toContain('Email é obrigatório');
      expect(response.body.message).toContain('Senha é obrigatória');
      expect(response.body.message).toContain('Função é obrigatória');
    });

    it('should validate email format', async () => {
      const response = await request(app)
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'New User',
          email: 'invalid',
          password: 'password123',
          role: 'user',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Email inválido');
    });

    it('should validate password strength', async () => {
      const response = await request(app)
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'New User',
          email: 'newuser@example.com',
          password: 'weak',
          role: 'user',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Senha muito fraca');
    });

    it('should validate role', async () => {
      const response = await request(app)
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'New User',
          email: 'newuser@example.com',
          password: 'password123',
          role: 'invalid',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Função inválida');
    });

    it('should validate unique email', async () => {
      const userData = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'password123',
        role: 'user',
      };

      await request(app)
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(userData);

      const response = await request(app)
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Email já cadastrado');
    });
  });

  describe('PUT /users/:id', () => {
    it('should update user for admin', async () => {
      const testUser = await createTestUser();
      const updateData = {
        name: 'Updated User',
        email: 'updated@example.com',
      };

      const response = await request(app)
        .put(`/users/${testUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.name).toBe(updateData.name);
      expect(response.body.email).toBe(updateData.email);

      const updatedUser = await User.findByPk(testUser.id);
      expect(updatedUser?.name).toBe(updateData.name);
      expect(updatedUser?.email).toBe(updateData.email);
    });

    it('should update own user for regular user', async () => {
      const updateData = {
        name: 'Updated User',
      };

      const response = await request(app)
        .put(`/users/${user.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.name).toBe(updateData.name);

      const updatedUser = await User.findByPk(user.id);
      expect(updatedUser?.name).toBe(updateData.name);
    });

    it('should not update other user for regular user', async () => {
      const otherUser = await createTestUser();

      const response = await request(app)
        .put(`/users/${otherUser.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Updated User',
        });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Acesso negado');
    });

    it('should handle non-existent user', async () => {
      const response = await request(app)
        .put('/users/999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Updated User',
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Usuário não encontrado');
    });

    it('should validate email format on update', async () => {
      const testUser = await createTestUser();

      const response = await request(app)
        .put(`/users/${testUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: 'invalid',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Email inválido');
    });

    it('should validate unique email on update', async () => {
      const user1 = await createTestUser({ email: 'user1@example.com' });
      const user2 = await createTestUser({ email: 'user2@example.com' });

      const response = await request(app)
        .put(`/users/${user2.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: user1.email,
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Email já cadastrado');
    });

    it('should validate role on update', async () => {
      const testUser = await createTestUser();

      const response = await request(app)
        .put(`/users/${testUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          role: 'invalid',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Função inválida');
    });
  });

  describe('DELETE /users/:id', () => {
    it('should delete user for admin', async () => {
      const testUser = await createTestUser();

      const response = await request(app)
        .delete(`/users/${testUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(204);

      const deletedUser = await User.findByPk(testUser.id);
      expect(deletedUser).toBeNull();
    });

    it('should not delete own user', async () => {
      const response = await request(app)
        .delete(`/users/${user.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Não é possível excluir o próprio usuário');

      const existingUser = await User.findByPk(user.id);
      expect(existingUser).not.toBeNull();
    });

    it('should not delete other user for regular user', async () => {
      const otherUser = await createTestUser();

      const response = await request(app)
        .delete(`/users/${otherUser.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Acesso negado');

      const existingUser = await User.findByPk(otherUser.id);
      expect(existingUser).not.toBeNull();
    });

    it('should handle non-existent user', async () => {
      const response = await request(app)
        .delete('/users/999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Usuário não encontrado');
    });
  });
}); 