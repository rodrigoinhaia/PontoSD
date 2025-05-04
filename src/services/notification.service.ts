import nodemailer from 'nodemailer';
import { envConfig } from '../config/env';
import { logger } from '../utils/logger';
import { Notificacao } from '../models/notificacao.model';
import { User } from '../models/user.model';

export class NotificationService {
  private static instance: NotificationService;
  private transporter: nodemailer.Transporter;

  private constructor() {
    this.transporter = nodemailer.createTransport({
      host: envConfig.email.host,
      port: envConfig.email.port,
      secure: false,
      auth: {
        user: envConfig.email.user,
        pass: envConfig.email.pass,
      },
    });
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Envia uma notificação por email
   */
  public async sendEmail(
    to: string,
    subject: string,
    text: string,
    html?: string
  ): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: envConfig.email.from,
        to,
        subject,
        text,
        html,
      });
    } catch (error) {
      logger.error('Erro ao enviar email:', error);
      throw new Error('Erro ao enviar email');
    }
  }

  /**
   * Cria uma notificação no banco de dados
   */
  public async createNotification(
    userId: number,
    type: string,
    title: string,
    message: string
  ): Promise<Notificacao> {
    try {
      return await Notificacao.create({
        userId,
        tipo: type,
        titulo: title,
        mensagem: message,
        lida: false,
      });
    } catch (error) {
      logger.error('Erro ao criar notificação:', error);
      throw new Error('Erro ao criar notificação');
    }
  }

  /**
   * Envia uma notificação para um usuário
   */
  public async sendNotification(
    userId: number,
    type: string,
    title: string,
    message: string
  ): Promise<void> {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      // Cria a notificação no banco de dados
      await this.createNotification(userId, type, title, message);

      // Envia email se o usuário tiver email
      if (user.email) {
        await this.sendEmail(
          user.email,
          title,
          message,
          `<p>${message}</p>`
        );
      }

      // TODO: Implementar notificações push
    } catch (error) {
      logger.error('Erro ao enviar notificação:', error);
      throw new Error('Erro ao enviar notificação');
    }
  }

  /**
   * Marca uma notificação como lida
   */
  public async markAsRead(notificationId: number): Promise<void> {
    try {
      const notification = await Notificacao.findByPk(notificationId);
      if (!notification) {
        throw new Error('Notificação não encontrada');
      }

      await notification.update({ lida: true });
    } catch (error) {
      logger.error('Erro ao marcar notificação como lida:', error);
      throw new Error('Erro ao marcar notificação como lida');
    }
  }

  /**
   * Obtém as notificações não lidas de um usuário
   */
  public async getUnreadNotifications(userId: number): Promise<Notificacao[]> {
    try {
      return await Notificacao.findAll({
        where: {
          userId,
          lida: false,
        },
        order: [['createdAt', 'DESC']],
      });
    } catch (error) {
      logger.error('Erro ao obter notificações não lidas:', error);
      throw new Error('Erro ao obter notificações não lidas');
    }
  }
} 