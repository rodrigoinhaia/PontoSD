import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { z } from 'zod';

// Schema de validação para criação de departamento
const createDepartmentSchema = z.object({
  name: z.string()
    .min(3, 'O nome deve ter pelo menos 3 caracteres')
    .max(100, 'O nome não pode ter mais de 100 caracteres'),
  companyId: z.number()
    .int('O ID da empresa deve ser um número inteiro')
    .positive('O ID da empresa deve ser positivo'),
});

// Schema de validação para atualização de departamento
const updateDepartmentSchema = z.object({
  name: z.string()
    .min(3, 'O nome deve ter pelo menos 3 caracteres')
    .max(100, 'O nome não pode ter mais de 100 caracteres')
    .optional(),
  companyId: z.number()
    .int('O ID da empresa deve ser um número inteiro')
    .positive('O ID da empresa deve ser positivo')
    .optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'Pelo menos um campo deve ser fornecido para atualização'
});

export const validateCreateDepartment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await createDepartmentSchema.parseAsync(req.body);
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

export const validateUpdateDepartment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await updateDepartmentSchema.parseAsync(req.body);
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

export const validateDepartmentId = async (
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