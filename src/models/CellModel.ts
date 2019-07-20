import { BaseFormatter } from './BaseFormatter';

export interface ICellModel {
  _id?: string;
  boardId: string;
  x: number;
  y: number;
  isFlagged?: boolean;
  content: number;
}

export class CellFormatter extends BaseFormatter implements ICellModel {
  public boardId: string = undefined;
  public x: number = undefined;
  public y: number = undefined;
  public isFlagged = undefined;
  public content = undefined;

  constructor(args: any) {
    super();
    args = this.format(args);
  }
}
