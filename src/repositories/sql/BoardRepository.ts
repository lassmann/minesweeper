import * as Sequelize from 'sequelize';

import { ProvideSingleton, inject } from '../../ioc';
import { BaseRepository } from './BaseRepository';
import { IBoardModel, BoardFormatter } from '../../models';
import { BoardEntity, CellEntity } from './entities';

@ProvideSingleton(BoardRepository)
export class BoardRepository extends BaseRepository<IBoardModel> {
  protected formatter: any = BoardFormatter;
  protected getInclude: Sequelize.IncludeOptions[] = [
    { model: this.cellEntity.model, as: 'cellList', attributes: ['x', 'y', 'isRevealed', 'isFlagged'] }
  ];
  protected logging: false | Function = false;

  constructor(
    @inject(BoardEntity) protected entityModel: BoardEntity,
    @inject(CellEntity) protected cellEntity: CellEntity
  ) {
    super();
  }
}
