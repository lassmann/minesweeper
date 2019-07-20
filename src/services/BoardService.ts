import { ProvideSingleton, inject } from '../ioc';
import { BaseService } from './BaseService';
import { BoardRepository, CellRepository } from '../repositories';
import { IBoardModel, BoardStatus, IPlayModel, ICellModel } from '../models';
import { ApiError } from '../config/ErrorHandler';
import constants from '../config/constants';

@ProvideSingleton(BoardService)
export class BoardService extends BaseService<IBoardModel> {

  constructor(
    @inject(BoardRepository) public repository: BoardRepository,
    @inject(CellRepository) public cellRepository: CellRepository
  ) {
    super();
  }

  public async createGame(game: IBoardModel): Promise<IBoardModel> {
    if (game.rows < 1 || game.columns < 1) throw new ApiError({ ...constants.errorTypes.validation, message: 'invalid row or columns' });
    if (game.mines < 1 || game.mines > (game.rows * game.columns)) throw new ApiError({ ...constants.errorTypes.validation, message: 'invalid mines' });
    game.status = BoardStatus.ONGOING;
    const minePos = [...Array(game.columns * game.rows)]
      .map((_, index) => index)
      .sort(() => 0.5 - Math.random())
      .filter((_, index) => index < game.mines);

    let mineMatrix = [...Array(game.rows)].map(() => [...Array(game.columns)]);
    const minesweeper = await this.create(game); // first create the
    const cellList: ICellModel[] = [];
    let matrixPos = 0;
    // here is created the mine matrix
    for (let x = 0; x < game.rows; x++) {
      for (let y = 0; y < game.columns; y++) {
        mineMatrix[x][y] = minePos.includes(matrixPos) ? -1 : 0;
        matrixPos++;
      }
    }
    // with the mine matrix we calculate the rest positions cells
    for (let x = 0; x < game.rows; x++) {
      for (let y = 0; y < game.columns; y++) {
        let content = mineMatrix[x][y];
        // only calculate clean positions
        if (!content) {
          for (let i = x - 1; i < x + 2; i++) {
            for (let j = y - 1; j < y + 2; j++) {
              if (i > -1 && i < game.rows && j > -1 && j < game.columns && mineMatrix[i][j]) content++;
            }
          }
        }
        cellList.push({
          boardId: minesweeper._id,
          x,
          y,
          isFlagged: false,
          isRevealed: false,
          content
        });
      }
    }
    await this.cellRepository.bulkWrite(cellList);
    return minesweeper;
  }
  
}
