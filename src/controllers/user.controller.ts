import { Request, Response } from 'express';
import { User } from '../models';
import { logger } from '../utils/logger';
import { sendEmail } from '../utils/email';

export const userController = {
  create: async (req: Request, res: Response) => {
    try {
      const { name, email, password, role, companyId, departmentId } = req.body;

      const existingUser = await User.findOne({ where: { email } });

      if (existingUser) {
        return res.status(400).json({ message: 'Email já cadastrado' });
      }

      const user = await User.create({
        name,
        email,
        password,
        role,
        companyId,
        departmentId,
      });

      await sendEmail({
        to: user.email,
        subject: 'Bem-vindo ao Sistema de Ponto',
        html: `
          <h1>Bem-vindo ao Sistema de Ponto</h1>
          <p>Olá ${user.name},</p>
          <p>Seu cadastro foi realizado com sucesso!</p>
          <p>Use suas credenciais para acessar o sistema:</p>
          <p>Email: ${user.email}</p>
          <p>Senha: ${password}</p>
          <p>Atenciosamente,<br>Equipe SD Informática</p>
        `,
      });

      return res.status(201).json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
        departmentId: user.departmentId,
      });
    } catch (error) {
      logger.error('Erro ao criar usuário:', error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  },

  findAll: async (req: Request, res: Response) => {
    try {
      const users = await User.findAll({
        attributes: ['id', 'name', 'email', 'role', 'active', 'createdAt'],
        include: ['company', 'department'],
      });

      return res.json(users);
    } catch (error) {
      logger.error('Erro ao buscar usuários:', error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  },

  findOne: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const user = await User.findByPk(id, {
        attributes: ['id', 'name', 'email', 'role', 'active', 'createdAt'],
        include: ['company', 'department'],
      });

      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      return res.json(user);
    } catch (error) {
      logger.error('Erro ao buscar usuário:', error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { name, email, password, role, active, companyId, departmentId } = req.body;

      const user = await User.findByPk(id);

      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      if (email && email !== user.email) {
        const existingUser = await User.findOne({ where: { email } });

        if (existingUser) {
          return res.status(400).json({ message: 'Email já cadastrado' });
        }
      }

      await user.update({
        name,
        email,
        password,
        role,
        active,
        companyId,
        departmentId,
      });

      return res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        active: user.active,
        companyId: user.companyId,
        departmentId: user.departmentId,
      });
    } catch (error) {
      logger.error('Erro ao atualizar usuário:', error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  },

  remove: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const user = await User.findByPk(id);

      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      await user.destroy();

      return res.status(204).send();
    } catch (error) {
      logger.error('Erro ao remover usuário:', error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  },
}; 