import * as Sequelize from 'sequelize';

import { ProvideSingleton, inject } from '../../../ioc';
import { SQLDbConnection } from '../../../config/SQLDbConnection';
import { BaseEntity } from './BaseEntity';
import { CellEntity } from './CellEntity';

@ProvideSingleton(BoardEntity)
export class BoardEntity extends BaseEntity {
  public entityName: string = 'board';
  protected attributes: Sequelize.DefineAttributes = {
    _id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.UUIDV4 },
    mines: { type: Sequelize.INTEGER, allowNull: false },
    rows: { type: Sequelize.INTEGER, allowNull: false},
    columns: { type: Sequelize.INTEGER, allowNull: false },
    boardGame: { type: Sequelize.JSON, allowNull: false }
  };
  protected options: Sequelize.DefineOptions<any> = { name: { plural: 'boards' }, paranoid: false, timestamps: true };

  constructor(
    @inject(SQLDbConnection) protected sqlDbConnection: SQLDbConnection,
    @inject(CellEntity) protected cellEntity: CellEntity
) {
    super();
    this.initModel();
    this.model.hasMany(this.cellEntity.model, { as: 'cellList' });
    this.cellEntity.model.belongsTo(this.model);
  }
}
