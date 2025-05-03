import nodemailer from 'nodemailer';
import { env } from './env';

const transporter = nodemailer.createTransport({
  host: env.MAIL_HOST,
  port: parseInt(env.MAIL_PORT),
  secure: env.MAIL_PORT === '465',
  auth: {
    user: env.MAIL_USER,
    pass: env.MAIL_PASS,
  },
});

transporter.verify((error) => {
  if (error) {
    console.error('Mail error:', error);
  } else {
    console.log('Mail connected');
  }
});

export { transporter }; 