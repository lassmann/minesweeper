import { ProvideSingleton, inject } from '../ioc';
import { BaseService } from './BaseService';
import { BoardRepository } from '../repositories';
import { IBoardModel, IPlayModel } from '../models';


@ProvideSingleton(BoardService)
export class BoardService extends BaseService<IBoardModel> {

  constructor(@inject(BoardRepository) public repository: BoardRepository) {
    super();
  }

  // public async createGame(game: IBoardModel): Promise<IBoardModel> {

  // }

  // public async play(move: IPlayModel): Promise<IBoardModel> {

  // }

}
