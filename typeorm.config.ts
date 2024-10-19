import serverConfig from '@gowagr/server/config/env.config';

const typeOrmConfig = {
  type: serverConfig.DATABASE_TYPE as any,
  host: serverConfig.DATABASE_HOST,
  port: serverConfig.DATABASE_PORT,
  username: serverConfig.DATABASE_USERNAME,
  password: serverConfig.DATABASE_PASSWORD,
  database: serverConfig.DATABASE_NAME,
  entities: ['dist/**/**/*.entity{.ts,.js}'],
  migrations: ['dist/src/server/database/migrations/*{.ts,.js}'],
  logging: serverConfig.isDev,
  synchronize: serverConfig.isDev,
  maxQueryExecutionTime: serverConfig.DB_MAX_QUERY_EXECUTION_TIME,
  migrationsTableName: 'migrations_typeorm',
};

export default typeOrmConfig;
