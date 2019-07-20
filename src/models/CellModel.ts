import { BaseFormatter } from './BaseFormatter';
import { createPublicKey } from 'crypto';

export interface ICellModel {
  _id?: string;
  boardId: string;
  x: number;
  y: number;
  isFlagged: boolean;
  isRevealed: boolean;
  content: number; // -1 represents a mine; 0 nothing and rest is number o near mines;
}

export class CellFormatter extends BaseFormatter implements ICellModel {
  public boardId: string = undefined;
  public x: number = undefined;
  public y: number = undefined;
  public isFlagged = undefined;
  public content = undefined;
  public isRevealed = undefined;

  constructor(args: any) {
    super();
    args = this.format(args);
  }
}
