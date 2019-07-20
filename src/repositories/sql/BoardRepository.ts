import { ProvideSingleton, inject } from '../../ioc';
import { BaseRepository } from './BaseRepository';
import { IBoardModel, BoardFormatter } from '../../models';
import { BoardEntity } from './entities';

@ProvideSingleton(BoardRepository)
export class BoardRepository extends BaseRepository<IBoardModel> {
  protected formatter: any = BoardFormatter;
  protected logging: false | Function = false;

  constructor(@inject(BoardEntity) protected entityModel: BoardEntity) {
    super();
  }
}
