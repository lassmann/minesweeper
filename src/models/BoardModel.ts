import { BaseFormatter } from './BaseFormatter';
import { ICellModel } from './CellModel';
export enum BoardStatus {
  ONGOING = 'ongoing',
  WIN = 'win',
  LOSE = 'game over'
}
export interface IBoardModel {
  _id?: string;
  mines: number;
  rows: number;
  columns: number;
  status?: BoardStatus;
  cellList?: ICellModel[];
  createdAt?: Date;
}

export class BoardFormatter extends BaseFormatter implements IBoardModel {
  public mines: number = undefined;
  public rows: number = undefined;
  public columns: number = undefined;
  public status: BoardStatus = undefined;
  public cellList: any = undefined;

  constructor(args: any) {
    super();
    args = this.format(args);
  }
}
