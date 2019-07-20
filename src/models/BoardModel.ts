import { BaseFormatter } from './BaseFormatter';

export enum Status {
  ONGOING = 'ongoing',
  WIN = 'win',
  LOOSE = 'loose'
}
export interface IBoardModel {
  _id?: string;
  mines: number;
  rows: number;
  columns: number;
  status: Status;
  createdAt?: Date;
}

export class BoardFormatter extends BaseFormatter implements IBoardModel {
  public mines: number = undefined;
  public rows: number = undefined;
  public columns: number = undefined;
  public status: Status = undefined;

  constructor(args: any) {
    super();
    args = this.format(args);
  }
}
