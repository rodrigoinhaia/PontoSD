import { NotificationService } from '../notification.service';
import { Notificacao } from '../../models/notificacao.model';
import { User } from '../../models/user.model';
import nodemailer from 'nodemailer';

jest.mock('nodemailer');
jest.mock('../../models/notificacao.model');
jest.mock('../../models/user.model');

describe('NotificationService', () => {
  let service: NotificationService;
  let mockTransporter: any;

  beforeEach(() => {
    service = NotificationService.getInstance();
    mockTransporter = {
      sendMail: jest.fn().mockResolvedValue({ messageId: '123' })
    };
    (nodemailer.createTransport as jest.Mock).mockReturnValue(mockTransporter);
    jest.clearAllMocks();
  });

  describe('sendEmail', () => {
    it('should send email successfully', async () => {
      const to = 'test@example.com';
      const subject = 'Test Subject';
      const text = 'Test Message';
      const html = '<p>Test Message</p>';

      await service.sendEmail(to, subject, text, html);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: expect.any(String),
        to,
        subject,
        text,
        html
      });
    });

    it('should throw error when email sending fails', async () => {
      mockTransporter.sendMail.mockRejectedValue(new Error('SMTP Error'));

      await expect(service.sendEmail('test@example.com', 'Test', 'Test'))
        .rejects
        .toThrow('Erro ao enviar email');
    });
  });

  describe('createNotification', () => {
    it('should create notification successfully', async () => {
      const mockNotification = {
        id: 1,
        userId: 1,
        tipo: 'INFO',
        titulo: 'Test',
        mensagem: 'Test Message',
        lida: false
      };

      (Notificacao.create as jest.Mock).mockResolvedValue(mockNotification);

      const notification = await service.createNotification(1, 'INFO', 'Test', 'Test Message');

      expect(Notificacao.create).toHaveBeenCalledWith({
        userId: 1,
        tipo: 'INFO',
        titulo: 'Test',
        mensagem: 'Test Message',
        lida: false
      });
      expect(notification).toEqual(mockNotification);
    });

    it('should throw error when notification creation fails', async () => {
      (Notificacao.create as jest.Mock).mockRejectedValue(new Error('DB Error'));

      await expect(service.createNotification(1, 'INFO', 'Test', 'Test'))
        .rejects
        .toThrow('Erro ao criar notificação');
    });
  });

  describe('sendNotification', () => {
    it('should send notification and email successfully', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com'
      };
      const mockNotification = {
        id: 1,
        userId: 1,
        tipo: 'INFO',
        titulo: 'Test',
        mensagem: 'Test Message',
        lida: false
      };

      (User.findByPk as jest.Mock).mockResolvedValue(mockUser);
      (Notificacao.create as jest.Mock).mockResolvedValue(mockNotification);
      mockTransporter.sendMail.mockResolvedValue({ messageId: '123' });

      await service.sendNotification(1, 'INFO', 'Test', 'Test Message');

      expect(User.findByPk).toHaveBeenCalledWith(1);
      expect(Notificacao.create).toHaveBeenCalledWith({
        userId: 1,
        tipo: 'INFO',
        titulo: 'Test',
        mensagem: 'Test Message',
        lida: false
      });
      expect(mockTransporter.sendMail).toHaveBeenCalled();
    });

    it('should throw error when user not found', async () => {
      (User.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(service.sendNotification(1, 'INFO', 'Test', 'Test'))
        .rejects
        .toThrow('Usuário não encontrado');
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read successfully', async () => {
      const mockNotification = {
        id: 1,
        update: jest.fn().mockResolvedValue(true)
      };

      (Notificacao.findByPk as jest.Mock).mockResolvedValue(mockNotification);

      await service.markAsRead(1);

      expect(Notificacao.findByPk).toHaveBeenCalledWith(1);
      expect(mockNotification.update).toHaveBeenCalledWith({ lida: true });
    });

    it('should throw error when notification not found', async () => {
      (Notificacao.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(service.markAsRead(1))
        .rejects
        .toThrow('Notificação não encontrada');
    });
  });

  describe('getUnreadNotifications', () => {
    it('should return unread notifications', async () => {
      const mockNotifications = [
        { id: 1, userId: 1, lida: false },
        { id: 2, userId: 1, lida: false }
      ];

      (Notificacao.findAll as jest.Mock).mockResolvedValue(mockNotifications);

      const notifications = await service.getUnreadNotifications(1);

      expect(Notificacao.findAll).toHaveBeenCalledWith({
        where: {
          userId: 1,
          lida: false
        },
        order: [['createdAt', 'DESC']]
      });
      expect(notifications).toEqual(mockNotifications);
    });

    it('should throw error when fetching notifications fails', async () => {
      (Notificacao.findAll as jest.Mock).mockRejectedValue(new Error('DB Error'));

      await expect(service.getUnreadNotifications(1))
        .rejects
        .toThrow('Erro ao obter notificações não lidas');
    });
  });
}); 