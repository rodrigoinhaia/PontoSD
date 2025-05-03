import request from 'supertest';
import { app } from '../../app';
import { createTestUser } from '../setup';
import { User } from '../../models/user.model';
import { logger } from '../../utils/logger';

jest.mock('../../utils/logger');

describe('Auth Integration Tests', () => {
  let user: any;

  beforeEach(async () => {
    user = await createTestUser();
  });

  describe('POST /auth/register', () => {
    it('should register a new user', async () => {
      const userData = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'password123',
        role: 'user',
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user.name).toBe(userData.name);
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.role).toBe(userData.role);
      expect(response.body.user).not.toHaveProperty('password');

      const createdUser = await User.findByPk(response.body.user.id);
      expect(createdUser).not.toBeNull();
      expect(createdUser?.name).toBe(userData.name);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Nome é obrigatório');
      expect(response.body.message).toContain('Email é obrigatório');
      expect(response.body.message).toContain('Senha é obrigatória');
      expect(response.body.message).toContain('Função é obrigatória');
    });

    it('should validate email format', async () => {
      const response = await request(app)
        .post('/auth/register')
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
        .post('/auth/register')
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
        .post('/auth/register')
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
        email: user.email,
        password: 'password123',
        role: 'user',
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Email já cadastrado');
    });
  });

  describe('POST /auth/login', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: user.email,
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user.name).toBe(user.name);
      expect(response.body.user.email).toBe(user.email);
      expect(response.body.user.role).toBe(user.role);
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Email é obrigatório');
      expect(response.body.message).toContain('Senha é obrigatória');
    });

    it('should validate email format', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'invalid',
          password: 'password123',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Email inválido');
    });

    it('should not login with invalid email', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Credenciais inválidas');
    });

    it('should not login with invalid password', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: user.email,
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Credenciais inválidas');
    });
  });

  describe('POST /auth/refresh-token', () => {
    it('should refresh token with valid refresh token', async () => {
      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          email: user.email,
          password: 'password123',
        });

      const response = await request(app)
        .post('/auth/refresh-token')
        .set('Authorization', `Bearer ${loginResponse.body.token}`)
        .send({
          refreshToken: loginResponse.body.refreshToken,
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.token).not.toBe(loginResponse.body.token);
    });

    it('should not refresh token with invalid refresh token', async () => {
      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          email: user.email,
          password: 'password123',
        });

      const response = await request(app)
        .post('/auth/refresh-token')
        .set('Authorization', `Bearer ${loginResponse.body.token}`)
        .send({
          refreshToken: 'invalid-refresh-token',
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Token de refresh inválido');
    });
  });

  describe('POST /auth/forgot-password', () => {
    it('should send password reset email', async () => {
      const response = await request(app)
        .post('/auth/forgot-password')
        .send({
          email: user.email,
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Email de recuperação enviado');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/auth/forgot-password')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Email é obrigatório');
    });

    it('should validate email format', async () => {
      const response = await request(app)
        .post('/auth/forgot-password')
        .send({
          email: 'invalid',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Email inválido');
    });

    it('should handle non-existent email', async () => {
      const response = await request(app)
        .post('/auth/forgot-password')
        .send({
          email: 'nonexistent@example.com',
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Email de recuperação enviado');
    });
  });

  describe('POST /auth/reset-password', () => {
    it('should reset password with valid token', async () => {
      const resetToken = 'valid-reset-token';
      const newPassword = 'newpassword123';

      const response = await request(app)
        .post('/auth/reset-password')
        .send({
          token: resetToken,
          password: newPassword,
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Senha alterada com sucesso');

      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          email: user.email,
          password: newPassword,
        });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body).toHaveProperty('token');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/auth/reset-password')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Token é obrigatório');
      expect(response.body.message).toContain('Senha é obrigatória');
    });

    it('should validate password strength', async () => {
      const response = await request(app)
        .post('/auth/reset-password')
        .send({
          token: 'valid-reset-token',
          password: 'weak',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Senha muito fraca');
    });

    it('should handle invalid token', async () => {
      const response = await request(app)
        .post('/auth/reset-password')
        .send({
          token: 'invalid-token',
          password: 'newpassword123',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Token inválido ou expirado');
    });
  });

  describe('POST /auth/change-password', () => {
    let token: string;

    beforeEach(async () => {
      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          email: user.email,
          password: 'password123',
        });

      token = loginResponse.body.token;
    });

    it('should change password with valid current password', async () => {
      const response = await request(app)
        .post('/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'password123',
          newPassword: 'newpassword123',
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Senha alterada com sucesso');

      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          email: user.email,
          password: 'newpassword123',
        });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body).toHaveProperty('token');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Senha atual é obrigatória');
      expect(response.body.message).toContain('Nova senha é obrigatória');
    });

    it('should validate current password', async () => {
      const response = await request(app)
        .post('/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'wrongpassword',
          newPassword: 'newpassword123',
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Senha atual inválida');
    });

    it('should validate new password strength', async () => {
      const response = await request(app)
        .post('/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'password123',
          newPassword: 'weak',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Senha muito fraca');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/auth/change-password')
        .send({
          currentPassword: 'password123',
          newPassword: 'newpassword123',
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Token não fornecido');
    });
  });
}); 