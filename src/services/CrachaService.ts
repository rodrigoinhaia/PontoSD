import JsBarcode from 'jsbarcode';
import { createCanvas, loadImage } from 'canvas';
import fs from 'fs';
import path from 'path';
import logger from '../utils/logger';
import { Colaborador } from '../types';

class CrachaService {
  private uploadDir: string;

  constructor() {
    this.uploadDir = path.join(__dirname, '../../public/uploads/crachas');
    this.ensureUploadDir();
  }

  private ensureUploadDir(): void {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  private async gerarCodigoBarras(matricula: string): Promise<Buffer> {
    const canvas = createCanvas(200, 100);
    JsBarcode(canvas, matricula, {
      format: 'CODE128',
      width: 2,
      height: 50,
      displayValue: true
    });

    return canvas.toBuffer('image/png');
  }

  public async gerarCracha(colaborador: Colaborador): Promise<string> {
    try {
      const canvas = createCanvas(600, 400);
      const ctx = canvas.getContext('2d');

      // Fundo do crachá
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 600, 400);

      // Foto do colaborador
      if (colaborador.foto) {
        const fotoPath = path.join(__dirname, '../../public', colaborador.foto);
        if (fs.existsSync(fotoPath)) {
          const foto = await loadImage(fotoPath);
          ctx.drawImage(foto, 20, 20, 150, 200);
        }
      }

      // Informações do colaborador
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 24px Arial';
      ctx.fillText(colaborador.nome, 200, 50);
      
      ctx.font = '18px Arial';
      ctx.fillText(`Matrícula: ${colaborador.matricula}`, 200, 100);
      ctx.fillText(`Cargo: ${colaborador.cargo}`, 200, 150);
      ctx.fillText(`Filial: ${colaborador.filialId}`, 200, 200);

      // Código de barras
      const codigoBarras = await this.gerarCodigoBarras(colaborador.matricula);
      const codigoBarrasImg = await loadImage(codigoBarras);
      ctx.drawImage(codigoBarrasImg, 200, 250, 200, 100);

      // Salvar o crachá
      const fileName = `cracha_${colaborador.matricula}_${Date.now()}.png`;
      const filePath = path.join(this.uploadDir, fileName);
      
      const buffer = canvas.toBuffer('image/png');
      fs.writeFileSync(filePath, buffer);

      logger.info(`Crachá gerado para o colaborador ${colaborador.nome}`);
      return `/uploads/crachas/${fileName}`;
    } catch (error) {
      logger.error('Erro ao gerar crachá:', error);
      throw new Error('Erro ao gerar crachá');
    }
  }
}

export default new CrachaService(); 