import { Route, Controller, Get, Tags } from 'tsoa';

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
    public async bitmexCandles(): Promise<void> {
        return this.service.getBitmexCandles();
    }
}
