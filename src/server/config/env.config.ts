import { config } from 'dotenv';
import * as env from 'env-var';

config();

const PORT = env.get('PORT').asInt();
const NODE_ENV = env.get('NODE_ENV').asString();
const isDev = env.get('NODE_ENV').asString() === 'development' ? true : false;
const DATABASE_TYPE =
  env.get('DATABASE_TYPE').required().asString() || 'postgres';
const DATABASE_HOST = env.get('DB_HOST').required().asString();
const DATABASE_PORT = env.get('DB_PORT').required().asInt();
const DATABASE_USERNAME = env.get('DB_USERNAME').required().asString();
const DATABASE_PASSWORD = env.get('DB_PASSWORD').required().asString();
const DATABASE_NAME = env.get('DB_NAME').required().asString();
const JWT_SECRET = env.get('JWT_SECRET').asString();
const JWT_EXPIRES_IN = env.get('JWT_EXPIRATION_TIME').asString();
const REFRESH_TOKEN_EXPIRATION_TIME = env
  .get('JWT_REFRESH_EXPIRATION_TIME')
  .asString();
const REFRESH_TOKEN_SECRET = env.get('JWT_REFRESH_SECRET').asString();
const DB_MAX_QUERY_EXECUTION_TIME = env
  .get('DB_MAX_QUERY_EXECUTION_TIME')
  .required()
  .asInt();

const serverConfig = {
  NODE_ENV,
  PORT,
  isDev,
  DATABASE_TYPE,
  DATABASE_HOST,
  DATABASE_PORT,
  DATABASE_USERNAME,
  DATABASE_PASSWORD,
  DATABASE_NAME,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRATION_TIME,
  REFRESH_TOKEN_SECRET,
  DB_MAX_QUERY_EXECUTION_TIME,

  smtp: {
    host: env.get('SMTP_HOST').asString(),
    user: env.get('SMTP_USER').asString(),
    pass: env.get('SMTP_PASS').asString(),
    senderEmail: env.get('SENDER_EMAIL').asString(),
    port: env.get('SMTP_PORT').asInt(),
  },
  twilio: {
    MESSAGE_SID: env.get('MESSAGE_SID').asString(),
    OTP_SENDER_TEMPLATE_ID: env.get('OTP_SENDER_TEMPLATE_ID').asString(),
    TWILIO_PHONE_NUMBER: env.get('TWILIO_PHONE_NUMBER').asString(),
  },
};

export default serverConfig;
