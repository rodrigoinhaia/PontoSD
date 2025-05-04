import { Op } from 'sequelize';
import { User } from '../models/user.model';
import { RegistroPonto } from '../models/registroPonto.model';
import { Relatorio } from '../models/relatorio.model';
import { logger } from '../utils/logger';
import { envConfig } from '../config/env';
import { Point } from '../models/point.model';
import { Company } from '../models/company.model';
import { Department } from '../models/department.model';
import { CacheService } from './cache.service';
import { AuditService } from './audit.service';
import { NotificationService } from './notification.service';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, differenceInMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

interface ReportFilters {
  userId?: string;
  companyId?: string;
  departmentId?: string;
  startDate?: Date;
  endDate?: Date;
}

interface WorkHoursSummary {
  totalHours: number;
  regularHours: number;
  overtimeHours: number;
  missingHours: number;
}

export class ReportService {
  private static instance: ReportService;
  private cacheService: CacheService;
  private auditService: AuditService;
  private notificationService: NotificationService;

  private constructor() {
    this.cacheService = new CacheService();
    this.auditService = new AuditService();
    this.notificationService = new NotificationService();
  }

  public static getInstance(): ReportService {
    if (!ReportService.instance) {
      ReportService.instance = new ReportService();
    }
    return ReportService.instance;
  }

  /**
   * Gera um relatório de ponto para um usuário em um período específico
   */
  public async generatePointReport(
    userId: number,
    startDate: Date,
    endDate: Date
  ): Promise<Relatorio> {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      const registros = await RegistroPonto.findAll({
        where: {
          userId,
          data: {
            [Op.between]: [startDate, endDate],
          },
        },
        order: [['data', 'ASC']],
      });

      const report = await Relatorio.create({
        userId,
        tipo: 'PONTO',
        periodoInicio: startDate,
        periodoFim: endDate,
        dados: JSON.stringify(registros),
      });

      return report;
    } catch (error) {
      logger.error('Erro ao gerar relatório de ponto:', error);
      throw new Error('Erro ao gerar relatório de ponto');
    }
  }

  /**
   * Gera um relatório de horas trabalhadas para um usuário em um período específico
   */
  public async generateHoursReport(
    userId: number,
    startDate: Date,
    endDate: Date
  ): Promise<Relatorio> {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      const registros = await RegistroPonto.findAll({
        where: {
          userId,
          data: {
            [Op.between]: [startDate, endDate],
          },
        },
        order: [['data', 'ASC']],
      });

      const horasTrabalhadas = this.calculateWorkedHours(registros);

      const report = await Relatorio.create({
        userId,
        tipo: 'HORAS',
        periodoInicio: startDate,
        periodoFim: endDate,
        dados: JSON.stringify({
          registros,
          horasTrabalhadas,
        }),
      });

      return report;
    } catch (error) {
      logger.error('Erro ao gerar relatório de horas:', error);
      throw new Error('Erro ao gerar relatório de horas');
    }
  }

  /**
   * Calcula as horas trabalhadas com base nos registros de ponto
   */
  private calculateWorkedHours(registros: RegistroPonto[]): number {
    let totalHoras = 0;
    let entrada: Date | null = null;
    let saida: Date | null = null;
    let inicioAlmoco: Date | null = null;
    let fimAlmoco: Date | null = null;

    for (const registro of registros) {
      switch (registro.tipo) {
        case 'ENTRADA':
          entrada = registro.data;
          break;
        case 'SAIDA':
          saida = registro.data;
          break;
        case 'INICIO_ALMOCO':
          inicioAlmoco = registro.data;
          break;
        case 'FIM_ALMOCO':
          fimAlmoco = registro.data;
          break;
      }

      if (entrada && saida) {
        const diff = saida.getTime() - entrada.getTime();
        totalHoras += diff / (1000 * 60 * 60);

        if (inicioAlmoco && fimAlmoco) {
          const diffAlmoco = fimAlmoco.getTime() - inicioAlmoco.getTime();
          totalHoras -= diffAlmoco / (1000 * 60 * 60);
        }

        entrada = null;
        saida = null;
        inicioAlmoco = null;
        fimAlmoco = null;
      }
    }

    return totalHoras;
  }

  /**
   * Exporta um relatório para PDF
   */
  public async exportToPDF(reportId: number): Promise<Buffer> {
    try {
      const report = await Relatorio.findByPk(reportId);
      if (!report) {
        throw new Error('Relatório não encontrado');
      }

      // TODO: Implementar exportação para PDF
      throw new Error('Exportação para PDF não implementada');
    } catch (error) {
      logger.error('Erro ao exportar relatório para PDF:', error);
      throw new Error('Erro ao exportar relatório para PDF');
    }
  }

  /**
   * Exporta um relatório para Excel
   */
  public async exportToExcel(reportId: number): Promise<Buffer> {
    try {
      const report = await Relatorio.findByPk(reportId);
      if (!report) {
        throw new Error('Relatório não encontrado');
      }

      // TODO: Implementar exportação para Excel
      throw new Error('Exportação para Excel não implementada');
    } catch (error) {
      logger.error('Erro ao exportar relatório para Excel:', error);
      throw new Error('Erro ao exportar relatório para Excel');
    }
  }

  async generateDailyReport(date: Date, filters?: ReportFilters): Promise<any> {
    const cacheKey = `daily-report:${format(date, 'yyyy-MM-dd')}:${JSON.stringify(filters)}`;
    const cachedReport = await this.cacheService.get(cacheKey);
    
    if (cachedReport) {
      return cachedReport;
    }

    const startDate = startOfDay(date);
    const endDate = endOfDay(date);

    const whereClause: any = {
      createdAt: {
        [Op.between]: [startDate, endDate]
      }
    };

    if (filters?.userId) whereClause.userId = filters.userId;
    if (filters?.companyId) whereClause.companyId = filters.companyId;
    if (filters?.departmentId) whereClause.departmentId = filters.departmentId;

    const points = await Point.findAll({
      where: whereClause,
      include: [
        { model: User, attributes: ['name', 'email'] },
        { model: Company, attributes: ['name'] },
        { model: Department, attributes: ['name'] }
      ],
      order: [['createdAt', 'ASC']]
    });

    const report = {
      date: format(date, 'dd/MM/yyyy', { locale: ptBR }),
      totalPoints: points.length,
      points: points.map(point => ({
        id: point.id,
        user: point.User?.name,
        company: point.Company?.name,
        department: point.Department?.name,
        type: point.type,
        time: format(point.createdAt, 'HH:mm'),
        status: point.status
      }))
    };

    await this.cacheService.set(cacheKey, report, 3600); // Cache for 1 hour
    await this.auditService.log('REPORT_GENERATED', {
      type: 'daily',
      date,
      filters
    });

    return report;
  }

  async generateWeeklyReport(startDate: Date, filters?: ReportFilters): Promise<any> {
    const cacheKey = `weekly-report:${format(startDate, 'yyyy-MM-dd')}:${JSON.stringify(filters)}`;
    const cachedReport = await this.cacheService.get(cacheKey);
    
    if (cachedReport) {
      return cachedReport;
    }

    const weekStart = startOfWeek(startDate);
    const weekEnd = endOfWeek(startDate);

    const whereClause: any = {
      createdAt: {
        [Op.between]: [weekStart, weekEnd]
      }
    };

    if (filters?.userId) whereClause.userId = filters.userId;
    if (filters?.companyId) whereClause.companyId = filters.companyId;
    if (filters?.departmentId) whereClause.departmentId = filters.departmentId;

    const points = await Point.findAll({
      where: whereClause,
      include: [
        { model: User, attributes: ['name', 'email'] },
        { model: Company, attributes: ['name'] },
        { model: Department, attributes: ['name'] }
      ],
      order: [['createdAt', 'ASC']]
    });

    const report = {
      week: `${format(weekStart, 'dd/MM/yyyy')} - ${format(weekEnd, 'dd/MM/yyyy')}`,
      totalPoints: points.length,
      points: points.map(point => ({
        id: point.id,
        user: point.User?.name,
        company: point.Company?.name,
        department: point.Department?.name,
        type: point.type,
        date: format(point.createdAt, 'dd/MM/yyyy'),
        time: format(point.createdAt, 'HH:mm'),
        status: point.status
      }))
    };

    await this.cacheService.set(cacheKey, report, 3600); // Cache for 1 hour
    await this.auditService.log('REPORT_GENERATED', {
      type: 'weekly',
      startDate,
      filters
    });

    return report;
  }

  async generateMonthlyReport(date: Date, filters?: ReportFilters): Promise<any> {
    const cacheKey = `monthly-report:${format(date, 'yyyy-MM')}:${JSON.stringify(filters)}`;
    const cachedReport = await this.cacheService.get(cacheKey);
    
    if (cachedReport) {
      return cachedReport;
    }

    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);

    const whereClause: any = {
      createdAt: {
        [Op.between]: [monthStart, monthEnd]
      }
    };

    if (filters?.userId) whereClause.userId = filters.userId;
    if (filters?.companyId) whereClause.companyId = filters.companyId;
    if (filters?.departmentId) whereClause.departmentId = filters.departmentId;

    const points = await Point.findAll({
      where: whereClause,
      include: [
        { model: User, attributes: ['name', 'email'] },
        { model: Company, attributes: ['name'] },
        { model: Department, attributes: ['name'] }
      ],
      order: [['createdAt', 'ASC']]
    });

    const report = {
      month: format(date, 'MMMM yyyy', { locale: ptBR }),
      totalPoints: points.length,
      points: points.map(point => ({
        id: point.id,
        user: point.User?.name,
        company: point.Company?.name,
        department: point.Department?.name,
        type: point.type,
        date: format(point.createdAt, 'dd/MM/yyyy'),
        time: format(point.createdAt, 'HH:mm'),
        status: point.status
      }))
    };

    await this.cacheService.set(cacheKey, report, 3600); // Cache for 1 hour
    await this.auditService.log('REPORT_GENERATED', {
      type: 'monthly',
      date,
      filters
    });

    return report;
  }

  async calculateWorkHours(userId: string, startDate: Date, endDate: Date): Promise<WorkHoursSummary> {
    const points = await Point.findAll({
      where: {
        userId,
        createdAt: {
          [Op.between]: [startDate, endDate]
        }
      },
      order: [['createdAt', 'ASC']]
    });

    let totalMinutes = 0;
    let regularMinutes = 0;
    let overtimeMinutes = 0;
    let missingMinutes = 0;

    const regularWorkDay = 8 * 60; // 8 hours in minutes

    for (let i = 0; i < points.length; i += 2) {
      if (i + 1 < points.length) {
        const entry = points[i];
        const exit = points[i + 1];
        
        const minutesWorked = differenceInMinutes(exit.createdAt, entry.createdAt);
        totalMinutes += minutesWorked;

        if (minutesWorked > regularWorkDay) {
          regularMinutes += regularWorkDay;
          overtimeMinutes += minutesWorked - regularWorkDay;
        } else {
          regularMinutes += minutesWorked;
          missingMinutes += regularWorkDay - minutesWorked;
        }
      }
    }

    return {
      totalHours: totalMinutes / 60,
      regularHours: regularMinutes / 60,
      overtimeHours: overtimeMinutes / 60,
      missingHours: missingMinutes / 60
    };
  }

  async exportToExcel(report: any, type: string): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Relatório');

    // Add headers
    const headers = Object.keys(report.points[0]);
    worksheet.addRow(headers);

    // Add data
    report.points.forEach((point: any) => {
      worksheet.addRow(Object.values(point));
    });

    // Style headers
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    // Auto-fit columns
    worksheet.columns.forEach(column => {
      column.width = 15;
    });

    return await workbook.xlsx.writeBuffer();
  }

  async exportToPDF(report: any, type: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument();
      const chunks: Buffer[] = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Add title
      doc.fontSize(20).text(`Relatório ${type}`, { align: 'center' });
      doc.moveDown();

      // Add date
      doc.fontSize(12).text(`Data: ${report.date || report.week || report.month}`);
      doc.moveDown();

      // Add table headers
      const headers = Object.keys(report.points[0]);
      const columnWidth = 100;
      let x = 50;

      headers.forEach(header => {
        doc.text(header, x, doc.y, { width: columnWidth });
        x += columnWidth;
      });

      doc.moveDown();

      // Add table rows
      report.points.forEach((point: any) => {
        x = 50;
        Object.values(point).forEach((value: any) => {
          doc.text(String(value), x, doc.y, { width: columnWidth });
          x += columnWidth;
        });
        doc.moveDown();
      });

      doc.end();
    });
  }
} 