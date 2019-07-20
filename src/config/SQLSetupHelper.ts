import * as Sequelize from 'sequelize';

import { Logger } from './Logger';
import { ProvideSingleton, inject } from '../ioc';
import { SQLDbConnection } from './SQLDbConnection';
import * as entities from '../repositories/sql/entities';

@ProvideSingleton(SQLSetupHelper)
export class SQLSetupHelper {

  constructor(
    @inject(SQLDbConnection) public sqlDbConnection: SQLDbConnection, // tslint:disable-line
    @inject(entities.BoardEntity) public boardEntity: entities.BoardEntity, // tslint:disable-line
    @inject(entities.CellEntity) public cellEntity: entities.CellEntity // tslint:disable-line
) { }

  public async rawQuery<T>(query: string): Promise<T> {
    return this.sqlDbConnection.db.query(query, { raw: true });
  }

  public async sync(options?: Sequelize.SyncOptions): Promise<void> {
    await this.sqlDbConnection.db.authenticate();
    Logger.log(`synchronizing: tables${options ? ` with options: ${JSON.stringify(options)}` : ''}`);
    await this.sqlDbConnection.db.sync(options);
  }
}
