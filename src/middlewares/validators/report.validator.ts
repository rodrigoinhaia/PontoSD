import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { z } from 'zod';

// Schema de validação para geração de relatório
const generateReportSchema = z.object({
  userId: z.number()
    .int('O ID do usuário deve ser um número inteiro')
    .positive('O ID do usuário deve ser positivo'),
  startDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inicial inválida'),
  endDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data final inválida'),
  type: z.enum(['daily', 'weekly', 'monthly', 'yearly'], {
    errorMap: () => ({ message: 'Tipo de relatório inválido' })
  }),
});

// Schema de validação para exportação de relatório
const exportReportSchema = z.object({
  format: z.enum(['pdf', 'excel'], {
    errorMap: () => ({ message: 'Formato de exportação inválido' })
  }),
});

export const validateGenerateReport = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await generateReportSchema.parseAsync(req.body);
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

export const validateExportReport = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await exportReportSchema.parseAsync(req.body);
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

export const validateReportId = async (
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