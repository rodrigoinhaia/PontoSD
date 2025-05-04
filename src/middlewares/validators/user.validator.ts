import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { z } from 'zod';

// Schema de validação para criação de usuário
const createUserSchema = z.object({
  name: z.string()
    .min(3, 'O nome deve ter pelo menos 3 caracteres')
    .max(100, 'O nome não pode ter mais de 100 caracteres'),
  email: z.string()
    .email('Email inválido'),
  password: z.string()
    .min(6, 'A senha deve ter pelo menos 6 caracteres')
    .regex(/[A-Z]/, 'A senha deve conter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'A senha deve conter pelo menos uma letra minúscula')
    .regex(/[0-9]/, 'A senha deve conter pelo menos um número'),
  role: z.enum(['admin', 'user'], {
    errorMap: () => ({ message: 'Função inválida' })
  }),
  companyId: z.number()
    .int('O ID da empresa deve ser um número inteiro')
    .positive('O ID da empresa deve ser positivo'),
  departmentId: z.number()
    .int('O ID do departamento deve ser um número inteiro')
    .positive('O ID do departamento deve ser positivo'),
});

// Schema de validação para atualização de usuário
const updateUserSchema = z.object({
  name: z.string()
    .min(3, 'O nome deve ter pelo menos 3 caracteres')
    .max(100, 'O nome não pode ter mais de 100 caracteres')
    .optional(),
  email: z.string()
    .email('Email inválido')
    .optional(),
  password: z.string()
    .min(6, 'A senha deve ter pelo menos 6 caracteres')
    .regex(/[A-Z]/, 'A senha deve conter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'A senha deve conter pelo menos uma letra minúscula')
    .regex(/[0-9]/, 'A senha deve conter pelo menos um número')
    .optional(),
  role: z.enum(['admin', 'user'], {
    errorMap: () => ({ message: 'Função inválida' })
  }).optional(),
  companyId: z.number()
    .int('O ID da empresa deve ser um número inteiro')
    .positive('O ID da empresa deve ser positivo')
    .optional(),
  departmentId: z.number()
    .int('O ID do departamento deve ser um número inteiro')
    .positive('O ID do departamento deve ser positivo')
    .optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'Pelo menos um campo deve ser fornecido para atualização'
});

export const validateCreateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await createUserSchema.parseAsync(req.body);
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

export const validateUpdateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await updateUserSchema.parseAsync(req.body);
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

export const validateUserId = async (
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