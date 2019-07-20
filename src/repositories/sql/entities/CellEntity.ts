import * as Sequelize from 'sequelize';

import { ProvideSingleton, inject } from '../../../ioc';
import { SQLDbConnection } from '../../../config/SQLDbConnection';
import { BaseEntity } from './BaseEntity';

@ProvideSingleton(CellEntity)
export class CellEntity extends BaseEntity {
  public entityName: string = 'cell';
  protected attributes: Sequelize.DefineAttributes = {
    _id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.UUIDV4 },
    x: { type: Sequelize.INTEGER },
    y: { type: Sequelize.INTEGER },
    content: { type: Sequelize.INTEGER },
    isFlagged: { type: Sequelize.BOOLEAN }
  };
  protected options: Sequelize.DefineOptions<any> = { name: { plural: 'cells' }, paranoid: false, timestamps: true };

  constructor(@inject(SQLDbConnection) protected sqlDbConnection: SQLDbConnection) {
    super();
    this.initModel();
  }
}
