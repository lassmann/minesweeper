import { Route, Controller, Get, Tags, Query } from 'tsoa';

import { ProvideSingleton, inject } from '../ioc';
import { BitmexService } from '../services';

@Tags('bitmex')
@Route('bitmex')
@ProvideSingleton(BitmexController)
export class BitmexController extends Controller {
    constructor(@inject(BitmexService) private service: BitmexService) {
        super();
    }

    @Get('')
    public async bitmexCandles(
        @Query('binSize') binSize: string,
        @Query('startTime') startTime?: string,
        @Query('endTime') endTime?: string
    ): Promise<void> {
        return this.service.getBitmexCandles(binSize, startTime, endTime);
    }

    @Get('pools')
    public async getScalpingJediPools(): Promise<void> {
        return this.service.getScalpingJediPools();
    }

    @Get('dataPools')
    public async getDataPools(
        @Query('from') from: string,
        @Query('to') to: string,
    ): Promise<void> {
        return this.service.getPoolsData(from, to);
    }
}
