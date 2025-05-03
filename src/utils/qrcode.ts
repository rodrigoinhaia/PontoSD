import QRCode from 'qrcode';
import path from 'path';
import fs from 'fs';
import logger from './logger';

export const generateQRCode = async (data: string): Promise<string> => {
  try {
    const uploadDir = path.join(__dirname, '../../uploads/qrcodes');
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.png`;
    const filepath = path.join(uploadDir, filename);

    await QRCode.toFile(filepath, data, {
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
      width: 300,
      margin: 1,
    });

    return `/uploads/qrcodes/${filename}`;
  } catch (error) {
    logger.error('Erro ao gerar QR Code:', error);
    throw error;
  }
}; 