import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

export const validatePoint = [
  body('type')
    .isIn(['entry', 'exit'])
    .withMessage('Tipo de ponto inválido. Deve ser "entry" ou "exit"'),

  body('latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude inválida. Deve estar entre -90 e 90 graus'),

  body('longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude inválida. Deve estar entre -180 e 180 graus'),

  body('address')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Endereço é obrigatório')
    .isLength({ max: 255 })
    .withMessage('Endereço deve ter no máximo 255 caracteres'),

  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
]; 