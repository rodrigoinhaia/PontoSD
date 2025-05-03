import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/user.model';
import { logger } from '../utils/logger';
import { sendEmail } from '../utils/email';

export const authController = {
  login: async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ where: { email } });

      if (!user) {
        return res.status(401).json({ message: 'Credenciais inválidas' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        return res.status(401).json({ message: 'Credenciais inválidas' });
      }

      const secret = process.env.JWT_SECRET;

      if (!secret) {
        logger.error('JWT_SECRET não configurado');
        return res.status(500).json({ message: 'Erro interno do servidor' });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email },
        secret,
        { expiresIn: '1h' }
      );

      const refreshToken = jwt.sign(
        { id: user.id, email: user.email },
        secret,
        { expiresIn: '7d' }
      );

      return res.json({
        token,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      });
    } catch (error) {
      logger.error('Erro no login:', error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  },

  refreshToken: async (req: Request, res: Response) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(401).json({ message: 'Token não fornecido' });
      }

      const secret = process.env.JWT_SECRET;

      if (!secret) {
        logger.error('JWT_SECRET não configurado');
        return res.status(500).json({ message: 'Erro interno do servidor' });
      }

      const decoded = jwt.verify(refreshToken, secret) as { id: number; email: string };

      const user = await User.findByPk(decoded.id);

      if (!user) {
        return res.status(401).json({ message: 'Usuário não encontrado' });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email },
        secret,
        { expiresIn: '1h' }
      );

      return res.json({ token });
    } catch (error) {
      logger.error('Erro ao atualizar token:', error);
      return res.status(401).json({ message: 'Token inválido' });
    }
  },

  forgotPassword: async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      const user = await User.findOne({ where: { email } });

      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      const secret = process.env.JWT_SECRET;

      if (!secret) {
        logger.error('JWT_SECRET não configurado');
        return res.status(500).json({ message: 'Erro interno do servidor' });
      }

      const resetToken = jwt.sign(
        { id: user.id, email: user.email },
        secret,
        { expiresIn: '1h' }
      );

      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

      await sendEmail({
        to: user.email,
        subject: 'Recuperação de Senha',
        html: `
          <h1>Recuperação de Senha</h1>
          <p>Clique no link abaixo para redefinir sua senha:</p>
          <a href="${resetUrl}">${resetUrl}</a>
          <p>Este link expira em 1 hora.</p>
        `,
      });

      return res.json({ message: 'Email de recuperação enviado' });
    } catch (error) {
      logger.error('Erro ao enviar email de recuperação:', error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  },

  resetPassword: async (req: Request, res: Response) => {
    try {
      const { token, password } = req.body;

      if (!token) {
        return res.status(401).json({ message: 'Token não fornecido' });
      }

      const secret = process.env.JWT_SECRET;

      if (!secret) {
        logger.error('JWT_SECRET não configurado');
        return res.status(500).json({ message: 'Erro interno do servidor' });
      }

      const decoded = jwt.verify(token, secret) as { id: number; email: string };

      const user = await User.findByPk(decoded.id);

      if (!user) {
        return res.status(401).json({ message: 'Usuário não encontrado' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      await user.update({ password: hashedPassword });

      return res.json({ message: 'Senha alterada com sucesso' });
    } catch (error) {
      logger.error('Erro ao resetar senha:', error);
      return res.status(401).json({ message: 'Token inválido' });
    }
  },
}; 