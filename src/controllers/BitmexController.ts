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
        @Query('endTime') endTime?: string,
        @Query('reverse') reverse?: boolean
    ): Promise<void> {
        return this.service.getBitmexCandles(binSize, startTime, endTime, reverse);
    }

    @Get('pools')
    public async getScalpingJediPools(): Promise<void> {
        return this.service.getScalpingJediPools();
    }

    @Get('bitcoinPrice')
    public async getBitcoinPrice(): Promise<void> {
        return this.service.getBitcoinPrice();
    }

    @Get('falconStatus')
    public async getFalconStatus(): Promise<void> {
        return this.service.getFalconStatus();
    }

    @Get('dataPools')
    public async getDataPools(
        @Query('from') from: string,
        @Query('to') to: string,
    ): Promise<void> {
        return this.service.getPoolsData(from, to);
    }

    // https://scalpingjedi.com/JSONS/chart_presion_data.json
    @Get('chart_presion_data')
    public async getChartPresionData(): Promise<void> {
        return this.service.getChartPresionData();
    }

    // https://scalpingjedi.com/JSONS/hf_status_falcon.json
    @Get('hf_status_falcon')
    public async getHFStatusFalcon(): Promise<void> {
        return this.service.getHFStatusFalcon();
    }

    // https://scalpingjedi.com/JSONS/hf_force_historic.json
    @Get('hf_force_historic')
    public async getHFForceHistoric(): Promise<void> {
        return this.service.getHFForceHistoric();
    }

    // https://scalpingjedi.com/getFalcon.php?startdate=1599609600-1599696000&t=1600991584234
    @Get('getFalcon')
    public async getFalcon(
        @Query('startdate') startdate: string,
        @Query('t') t: string,
    ): Promise<void> {
        return this.service.getFalcon(startdate, t);
    }

    // https://scalpingjedi.com/JSONS/chartpresion_nextstep.json
    @Get('chartpresionNextstep')
    public async chartpresionNextstep(): Promise<void> {
        return this.service.chartpresionNextstep();
    }

    // https://scalpingjedi.com/JSONS/lastkill.json
    @Get('lastKill')
    public async getLastkill(): Promise<void> {
        return this.service.getLastkill();
    }

    // https://scalpingjedi.com/JSONS/historial_liquidacion.json
    @Get('historialLiquidaciones')
    public async getHistorialLiquidacion(): Promise<void> {
        return this.service.getHistorialLiquidacion();
    }

    // https://scalpingjedi.com/JSONS/bigorders_data_0.json
    @Get('bigorders')
    public async getHistgetBigOrdersorialLiquidacion(): Promise<void> {
        return this.service.getBigOrders();
    }

    // https://scalpingjedi.com/JSONS/power_nextstep.json
    @Get('power_nextstep')
    public async getPowerNextstep(): Promise<void> {
        return this.service.getPowerNextstep();
    }

    // https://scalpingjedi.com/JSONS/power_data_0.json
    @Get('power_data')
    public async getPowerData(): Promise<void> {
        return this.service.getPowerData();
    }

    // https://scalpingjedi.com/JSONS/open_interest_5m.json
    @Get('open_interest')
    public async getOpenIterest(): Promise<void> {
        return this.service.getOpenInterest();
    }
}
