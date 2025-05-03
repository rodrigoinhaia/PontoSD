import PDFDocument from 'pdfkit';
import moment from 'moment-timezone';
import logger from './logger';

interface ReportData {
  user: {
    name: string;
    email: string;
  };
  date?: string;
  period?: string;
  points: Array<{
    date?: string;
    type: string;
    time: string;
    address: string;
  }>;
}

export const generatePDF = async (data: ReportData): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (error: Error) => reject(error));

      // Cabeçalho
      doc
        .fontSize(20)
        .text('Relatório de Ponto', { align: 'center' })
        .moveDown();

      // Informações do usuário
      doc
        .fontSize(12)
        .text(`Nome: ${data.user.name}`)
        .text(`Email: ${data.user.email}`)
        .moveDown();

      // Período
      if (data.date) {
        doc.text(`Data: ${data.date}`);
      } else if (data.period) {
        doc.text(`Período: ${data.period}`);
      }
      doc.moveDown();

      // Tabela de pontos
      const tableTop = doc.y;
      const tableLeft = 50;
      const colWidth = 100;
      const rowHeight = 30;

      // Cabeçalho da tabela
      doc
        .fontSize(10)
        .text('Data', tableLeft, tableTop)
        .text('Tipo', tableLeft + colWidth, tableTop)
        .text('Horário', tableLeft + colWidth * 2, tableTop)
        .text('Endereço', tableLeft + colWidth * 3, tableTop);

      // Linhas da tabela
      data.points.forEach((point, index) => {
        const y = tableTop + rowHeight * (index + 1);
        doc
          .text(point.date || '', tableLeft, y)
          .text(point.type, tableLeft + colWidth, y)
          .text(point.time, tableLeft + colWidth * 2, y)
          .text(point.address, tableLeft + colWidth * 3, y);
      });

      // Rodapé
      doc
        .moveDown(2)
        .fontSize(10)
        .text(
          `Gerado em: ${moment().format('DD/MM/YYYY HH:mm:ss')}`,
          { align: 'right' }
        );

      doc.end();
    } catch (error) {
      logger.error('Erro ao gerar PDF:', error);
      reject(error);
    }
  });
}; 