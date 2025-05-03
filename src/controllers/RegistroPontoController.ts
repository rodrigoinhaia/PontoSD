import { Request, Response } from 'express';
import RegistroPonto from '../models/RegistroPonto';
import Colaborador from '../models/Colaborador';
import logger from '../utils/logger';
import { env } from '../config/env';

class RegistroPontoController {
  public async registrarPonto(req: Request, res: Response): Promise<Response> {
    try {
      const { tipo, latitude, longitude, foto, metodoRegistro, dispositivoId, observacao } = req.body;
      const colaboradorId = req.user?.id;

      if (!colaboradorId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const colaborador = await Colaborador.findByPk(colaboradorId);
      if (!colaborador) {
        return res.status(404).json({ error: 'Colaborador não encontrado' });
      }

      const registro = await RegistroPonto.create({
        colaboradorId,
        tipo,
        dataHora: new Date(),
        latitude,
        longitude,
        foto,
        metodoRegistro,
        dispositivoId,
        observacao,
        status: 'normal'
      });

      logger.info(`Registro de ponto criado para o colaborador ${colaborador.nome}`);

      return res.status(201).json(registro);
    } catch (error) {
      logger.error('Erro ao registrar ponto:', error);
      return res.status(500).json({ error: 'Erro ao registrar ponto' });
    }
  }

  public async listarRegistros(req: Request, res: Response): Promise<Response> {
    try {
      const colaboradorId = req.user?.id;
      const { dataInicio, dataFim } = req.query;

      if (!colaboradorId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const where: any = { colaboradorId };

      if (dataInicio && dataFim) {
        where.dataHora = {
          [Op.between]: [new Date(dataInicio as string), new Date(dataFim as string)]
        };
      }

      const registros = await RegistroPonto.findAll({
        where,
        order: [['dataHora', 'DESC']]
      });

      return res.json(registros);
    } catch (error) {
      logger.error('Erro ao listar registros:', error);
      return res.status(500).json({ error: 'Erro ao listar registros' });
    }
  }

  public async justificarRegistro(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { justificativa } = req.body;
      const aprovadorId = req.user?.id;

      if (!aprovadorId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const registro = await RegistroPonto.findByPk(id);
      if (!registro) {
        return res.status(404).json({ error: 'Registro não encontrado' });
      }

      await registro.update({
        status: 'justificado',
        justificativa,
        aprovadoPor: aprovadorId,
        dataAprovacao: new Date()
      });

      logger.info(`Registro ${id} justificado pelo usuário ${aprovadorId}`);

      return res.json(registro);
    } catch (error) {
      logger.error('Erro ao justificar registro:', error);
      return res.status(500).json({ error: 'Erro ao justificar registro' });
    }
  }
}

export default new RegistroPontoController(); 