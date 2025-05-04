import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { z } from 'zod';

// Schema de validação para criação de horário
const createScheduleSchema = z.object({
  name: z.string()
    .min(3, 'O nome deve ter pelo menos 3 caracteres')
    .max(100, 'O nome não pode ter mais de 100 caracteres'),
  entryTime: z.string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Horário de entrada inválido'),
  exitTime: z.string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Horário de saída inválido'),
  tolerance: z.number()
    .int('A tolerância deve ser um número inteiro')
    .min(0, 'A tolerância não pode ser negativa')
    .max(60, 'A tolerância não pode ser maior que 60 minutos'),
  companyId: z.number()
    .int('O ID da empresa deve ser um número inteiro')
    .positive('O ID da empresa deve ser positivo'),
});

// Schema de validação para atualização de horário
const updateScheduleSchema = z.object({
  name: z.string()
    .min(3, 'O nome deve ter pelo menos 3 caracteres')
    .max(100, 'O nome não pode ter mais de 100 caracteres')
    .optional(),
  entryTime: z.string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Horário de entrada inválido')
    .optional(),
  exitTime: z.string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Horário de saída inválido')
    .optional(),
  tolerance: z.number()
    .int('A tolerância deve ser um número inteiro')
    .min(0, 'A tolerância não pode ser negativa')
    .max(60, 'A tolerância não pode ser maior que 60 minutos')
    .optional(),
  companyId: z.number()
    .int('O ID da empresa deve ser um número inteiro')
    .positive('O ID da empresa deve ser positivo')
    .optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'Pelo menos um campo deve ser fornecido para atualização'
});

export const validateCreateSchedule = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await createScheduleSchema.parseAsync(req.body);
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

export const validateUpdateSchedule = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await updateScheduleSchema.parseAsync(req.body);
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

export const validateScheduleId = async (
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