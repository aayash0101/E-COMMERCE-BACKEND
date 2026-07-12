import dotenv from 'dotenv';

dotenv.config();


const requiredEnvVars = [
  'PORT',
  'NODE_ENV',
  'MONGO_URI',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'JWT_ACCESS_EXPIRES_IN',
  'JWT_REFRESH_EXPIRES_IN',
  'CLIENT_URL',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'ESEWA_SECRET_KEY',
  'ESEWA_MERCHANT_CODE',
  'ESEWA_PAYMENT_URL',
  'ESEWA_VERIFY_URL',
  'FRONTEND_URL',
] as const;

function validateEnv(): void {
  const missing = requiredEnvVars.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}. ` +
      `Check your .env file against .env.example.`
    );
  }
}

validateEnv();


export const env = {
  port: Number(process.env.PORT),
  nodeEnv: process.env.NODE_ENV as 'development' | 'production' | 'test',
  mongoUri: process.env.MONGO_URI as string,
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET as string,
    refreshSecret: process.env.JWT_REFRESH_SECRET as string,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN as string,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN as string,
  },
  clientUrl: process.env.CLIENT_URL as string,
  frontendUrl: process.env.FRONTEND_URL as string,
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME!,
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY!,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET!,
  esewa: {
    secretKey: process.env.ESEWA_SECRET_KEY as string,
    merchantCode: process.env.ESEWA_MERCHANT_CODE as string,
    paymentUrl: process.env.ESEWA_PAYMENT_URL as string,
    verifyUrl: process.env.ESEWA_VERIFY_URL as string,
  },
} as const;