import { ProvideSingleton } from '../ioc';
import { BaseService } from './BaseService';
import { get } from 'request-promise';

@ProvideSingleton(BitmexService)
export class BitmexService extends BaseService<any> {
  public get = get;
  constructor() {
    super();
  }

  public async  getBitmexCandles() {
    const res = await this.get(`https://www.bitmex.com/api/v1/trade/bucketed?binSize=1m&symbol=XBTUSD&count=1000&reverse=true`);
    return JSON.parse(res);
  }
}
