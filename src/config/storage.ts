import { S3 } from 'aws-sdk';
import { env } from './env';

let storage: S3 | null = null;

if (env.STORAGE_TYPE === 's3') {
  storage = new S3({
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    region: env.AWS_REGION,
  });
}

export { storage }; 