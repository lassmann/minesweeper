import * as express from 'express';
import * as swaggerUi from 'swagger-ui-express';
import * as bodyParser from 'body-parser';
import * as morgan from 'morgan';

import { Logger } from './Logger';
import constants from './constants';
import { ErrorHandler } from './ErrorHandler';
import { RegisterRoutes } from '../../build/routes';
import { iocContainer } from '../ioc';
import { SQLSetupHelper } from './SQLSetupHelper';
import '../controllers';

export class Server {
  public app: express.Express = express();
  private readonly port: number = constants.port;

  constructor() {
    this.app.use(this.allowCors);
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.app.use(bodyParser.json());
    // this.app.use(morgan('dev', { skip: () => {} }));
    RegisterRoutes(this.app);
    this.app.use(ErrorHandler.handleError);

    if (!constants.isProd && !constants.isStage) {
      const swaggerDocument = require('../../build/swagger/swagger.json');
      const swaggerOptions = { explorer: false };
      this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, swaggerOptions));
    }
  }

  public async listen(port: number = this.port) {
    process.on('uncaughtException', this.criticalErrorHandler);
    process.on('unhandledRejection', this.criticalErrorHandler);
    await iocContainer.get<SQLSetupHelper>(SQLSetupHelper).sync({ force: false });
    const listen = this.app.listen(this.port);

    Logger.info(`${constants.environment} server running on port: ${this.port}`);
    return listen;
  }

  private criticalErrorHandler(...args) {
    console.log(args)
    Logger.error('Critical Error...', ...args);
    process.exit(1);
  }

  private allowCors(req: express.Request, res: express.Response, next: express.NextFunction): void {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, DELETE, HEAD, PATCH');
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization, apiKey, x-access-token, id-token',
    );
    next();
  }

}
