import { Request, Response } from 'express';
import { Department, Company } from '../models';
import { logger } from '../utils/logger';

export const departmentController = {
  create: async (req: Request, res: Response) => {
    try {
      const { name, description, companyId } = req.body;

      const company = await Company.findByPk(companyId);

      if (!company) {
        return res.status(404).json({ message: 'Empresa não encontrada' });
      }

      const existingDepartment = await Department.findOne({
        where: { name, companyId },
      });

      if (existingDepartment) {
        return res.status(400).json({ message: 'Departamento já existe nesta empresa' });
      }

      const department = await Department.create({
        name,
        description,
        companyId,
      });

      return res.status(201).json({
        id: department.id,
        name: department.name,
        description: department.description,
        companyId: department.companyId,
      });
    } catch (error) {
      logger.error('Erro ao criar departamento:', error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  },

  findAll: async (req: Request, res: Response) => {
    try {
      const departments = await Department.findAll({
        attributes: ['id', 'name', 'description', 'active', 'createdAt'],
        include: ['company', 'users'],
      });

      return res.json(departments);
    } catch (error) {
      logger.error('Erro ao buscar departamentos:', error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  },

  findOne: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const department = await Department.findByPk(id, {
        attributes: ['id', 'name', 'description', 'active', 'createdAt'],
        include: ['company', 'users'],
      });

      if (!department) {
        return res.status(404).json({ message: 'Departamento não encontrado' });
      }

      return res.json(department);
    } catch (error) {
      logger.error('Erro ao buscar departamento:', error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { name, description, companyId, active } = req.body;

      const department = await Department.findByPk(id);

      if (!department) {
        return res.status(404).json({ message: 'Departamento não encontrado' });
      }

      if (companyId) {
        const company = await Company.findByPk(companyId);

        if (!company) {
          return res.status(404).json({ message: 'Empresa não encontrada' });
        }
      }

      if (name && name !== department.name) {
        const existingDepartment = await Department.findOne({
          where: { name, companyId: companyId || department.companyId },
        });

        if (existingDepartment) {
          return res.status(400).json({ message: 'Departamento já existe nesta empresa' });
        }
      }

      await department.update({
        name,
        description,
        companyId,
        active,
      });

      return res.json({
        id: department.id,
        name: department.name,
        description: department.description,
        companyId: department.companyId,
        active: department.active,
      });
    } catch (error) {
      logger.error('Erro ao atualizar departamento:', error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  },

  remove: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const department = await Department.findByPk(id);

      if (!department) {
        return res.status(404).json({ message: 'Departamento não encontrado' });
      }

      await department.destroy();

      return res.status(204).send();
    } catch (error) {
      logger.error('Erro ao remover departamento:', error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  },
}; 