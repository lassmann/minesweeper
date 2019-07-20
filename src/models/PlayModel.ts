
export enum Instruction {
    FLAG = 'flag',
    REVEAL = 'reveal'
}
export interface IPlayModel {
    boardId: string;
    x: number;
    y: number;
    instruction: Instruction;
    createdAt?: Date;
}
