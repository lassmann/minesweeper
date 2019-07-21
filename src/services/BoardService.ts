import { ProvideSingleton, inject } from '../ioc';
import { BaseService } from './BaseService';
import { BoardRepository, CellRepository } from '../repositories';
import { IBoardModel, BoardStatus, IPlayModel, ICellModel, Instruction } from '../models';
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
    return this.getById(minesweeper._id);
  }

  public async revealCleanNeighbors(board: IBoardModel, cell: ICellModel) {
    for (let i = cell.x - 1; i < cell.x + 2; i++) {
      for (let j = cell.y - 1; j < cell.y + 2; j++) {
        if (i > -1 && j > -1 && i < board.rows && j < board.rows && i !== cell.x && j !== cell.y) {
          const neighbour = await this.cellRepository.findOne({ boardId: board._id, x: i, y: j });
          await this.cellRepository.update(neighbour._id, { ...neighbour, isRevealed: true });
          if (!neighbour.content) this.revealCleanNeighbors(board, neighbour);
        }
      }
    }
  }

  public async play(model: IPlayModel): Promise<IBoardModel> {
    const board = await this.getById(model.boardId);
    if (board.status === BoardStatus.LOSE) throw new ApiError({ ...constants.errorTypes.validation, message: BoardStatus.LOSE });
    if (model.x < 0 || model.y < 0 || model.x >= board.rows || model.y >= board.columns)
      throw new ApiError({ ...constants.errorTypes.validation, message: 'invalid row or columns' });

    const cell = await this.cellRepository.findOne({ boardId: model.boardId, x: model.x, y: model.y });

    if (model.instruction === Instruction.FLAG) {
      await this.cellRepository.update(cell._id, { ...cell, isFlagged: true });
      const mines = await this.cellRepository.find(null, null, null, JSON.stringify({ boardId: model.boardId, content: -1 }), null);
      if (mines.every(mine => mine.isFlagged)) await this.repository.update(board._id, { ...board, status: BoardStatus.WIN });
    }
    if (model.instruction === Instruction.REVEAL) {
      if (cell.content === -1) await this.repository.update(board._id, { ...board, status: BoardStatus.LOSE });
      if (cell.content === 0) await this.revealCleanNeighbors(board, cell); // recursive update to this al all near Neighbors;
      await this.cellRepository.update(cell._id, { ...cell, isRevealed: true });
    }
    return this.getById(model.boardId);
  }
}
