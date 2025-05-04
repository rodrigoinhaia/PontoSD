import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { z } from 'zod';

// Schema de validação para criação de empresa
const createCompanySchema = z.object({
  name: z.string()
    .min(3, 'O nome deve ter pelo menos 3 caracteres')
    .max(100, 'O nome não pode ter mais de 100 caracteres'),
  cnpj: z.string()
    .regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}$/, 'CNPJ inválido'),
});

// Schema de validação para atualização de empresa
const updateCompanySchema = z.object({
  name: z.string()
    .min(3, 'O nome deve ter pelo menos 3 caracteres')
    .max(100, 'O nome não pode ter mais de 100 caracteres')
    .optional(),
  cnpj: z.string()
    .regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}$/, 'CNPJ inválido')
    .optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'Pelo menos um campo deve ser fornecido para atualização'
});

export const validateCreateCompany = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await createCompanySchema.parseAsync(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }
    next(error);
  }
};

export const validateUpdateCompany = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await updateCompanySchema.parseAsync(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }
    next(error);
  }
};

export const validateCompanyId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}; 