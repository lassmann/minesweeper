import { BaseFormatter } from './BaseFormatter';

export enum BoardStatus {
  ONGOING = 'ongoing',
  WIN = 'win',
  LOOSE = 'loose'
}
export interface IBoardModel {
  _id?: string;
  mines: number;
  rows: number;
  columns: number;
  status?: BoardStatus;
  boardGame?: any;
  createdAt?: Date;
}

export class BoardFormatter extends BaseFormatter implements IBoardModel {
  public mines: number = undefined;
  public rows: number = undefined;
  public columns: number = undefined;
  public status: BoardStatus = undefined;
  public boardGame: any = undefined;

  constructor(args: any) {
    super();
    args = this.format(args);
  }
}
