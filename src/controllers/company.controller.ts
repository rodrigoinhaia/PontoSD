import { Request, Response } from 'express';
import { Company } from '../models';
import { logger } from '../utils/logger';

export const companyController = {
  create: async (req: Request, res: Response) => {
    try {
      const { name, cnpj, address, phone, email } = req.body;

      const existingCompany = await Company.findOne({ where: { cnpj } });

      if (existingCompany) {
        return res.status(400).json({ message: 'CNPJ já cadastrado' });
      }

      const company = await Company.create({
        name,
        cnpj,
        address,
        phone,
        email,
      });

      return res.status(201).json({
        id: company.id,
        name: company.name,
        cnpj: company.cnpj,
        address: company.address,
        phone: company.phone,
        email: company.email,
      });
    } catch (error) {
      logger.error('Erro ao criar empresa:', error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  },

  findAll: async (req: Request, res: Response) => {
    try {
      const companies = await Company.findAll({
        attributes: ['id', 'name', 'cnpj', 'address', 'phone', 'email', 'active', 'createdAt'],
        include: ['users', 'departments'],
      });

      return res.json(companies);
    } catch (error) {
      logger.error('Erro ao buscar empresas:', error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  },

  findOne: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const company = await Company.findByPk(id, {
        attributes: ['id', 'name', 'cnpj', 'address', 'phone', 'email', 'active', 'createdAt'],
        include: ['users', 'departments'],
      });

      if (!company) {
        return res.status(404).json({ message: 'Empresa não encontrada' });
      }

      return res.json(company);
    } catch (error) {
      logger.error('Erro ao buscar empresa:', error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { name, cnpj, address, phone, email, active } = req.body;

      const company = await Company.findByPk(id);

      if (!company) {
        return res.status(404).json({ message: 'Empresa não encontrada' });
      }

      if (cnpj && cnpj !== company.cnpj) {
        const existingCompany = await Company.findOne({ where: { cnpj } });

        if (existingCompany) {
          return res.status(400).json({ message: 'CNPJ já cadastrado' });
        }
      }

      await company.update({
        name,
        cnpj,
        address,
        phone,
        email,
        active,
      });

      return res.json({
        id: company.id,
        name: company.name,
        cnpj: company.cnpj,
        address: company.address,
        phone: company.phone,
        email: company.email,
        active: company.active,
      });
    } catch (error) {
      logger.error('Erro ao atualizar empresa:', error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  },

  remove: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const company = await Company.findByPk(id);

      if (!company) {
        return res.status(404).json({ message: 'Empresa não encontrada' });
      }

      await company.destroy();

      return res.status(204).send();
    } catch (error) {
      logger.error('Erro ao remover empresa:', error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  },
}; 