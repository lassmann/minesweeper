import { Route, Controller, Get, Post, Body, Tags, Request } from 'tsoa';
import { Request as expressRequest } from 'express';

import { ProvideSingleton, inject } from '../ioc';
import { IBoardModel, IPlayModel } from '../models';
import { BoardService } from '../services';

@Tags('board')
@Route('board')
@ProvideSingleton(BoardController)
export class BoardController extends Controller {
    constructor(@inject(BoardService) private service: BoardService) {
        super();
    }

    @Post('/')
    public async create(@Body() model: IBoardModel, ): Promise<IBoardModel> {
        return this.service.createGame(model);
    }

    @Post('/play')
    public async play(@Body() model: IPlayModel, ): Promise<IBoardModel> {
        return this.service.play(model);
    }

    @Get('{id}')
    public async getById(id: string, @Request() request: expressRequest): Promise<IBoardModel> {
        return this.service.getById(id);
    }
}
