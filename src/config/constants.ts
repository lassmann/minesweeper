import { resolve as pathResolve } from 'path';
import { config } from 'dotenv';

const { env } = process;
config({ path: pathResolve(__dirname, `./env/.env.${env.NODE_ENV || 'local'}`) });

export default {
  environment: env.NODE_ENV,
  version: 'x.x.x',
  isProd: env.NODE_ENV === 'production',
  isStage: env.NODE_ENV === 'stage',
  isQa: env.NODE_ENV === 'qa',
  isDev: env.NODE_ENV === 'development',
  isLocal: env.NODE_ENV === 'local',
  isTest: env.NODE_ENV === 'test',
  port: Number(env.PORT),
  SQL: {
    db: env.RDS_DB_NAME || env.SQL_DB,
    username: env.RDS_USERNAME || env.SQL_USERNAME,
    password: env.RDS_PASSWORD || env.SQL_PASSWORD,
    host: env.RDS_HOSTNAME || env.SQL_HOST,
    port: Number(env.RDS_PORT || env.SQL_PORT),
    dialect: env.SQL_DIALECT
  },
  errorTypes: {
    db: { statusCode: 500, name: 'Internal Server Error', message: 'database error' },
    external: { statusCode: 502, name: 'Bad Gateway', message: 'external server/provider error' },
    validation: { statusCode: 400, name: 'Bad Request', message: 'validation error' },
    auth: { statusCode: 401, name: 'Unauthorized', message: 'auth error' },
    forbidden: { statusCode: 403, name: 'Forbidden', message: 'forbidden content' },
    notFound: { statusCode: 404, name: 'Not Found', message: 'content not found' },
    entity: { statusCode: 422, name: 'Unprocessable Entity', message: 'entity error' }
  },
  get errorMap() {
    return {
      ValidateError: this.errorTypes.validation,
      ValidationError: this.errorTypes.validation,
      CastError: this.errorTypes.db
    };
  }
};
