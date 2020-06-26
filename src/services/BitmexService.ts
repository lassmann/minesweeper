import { ProvideSingleton } from '../ioc';
import { BaseService } from './BaseService';
import { get } from 'request-promise';
import fetch from 'node-fetch';
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

  public async getScalpingJediPools() {
    const res = await this.get(`https://scalpingjedi.com/JSONS/poolsdata_step_5.json?nocache=${Date.now()}`);
    return JSON.parse(res);
  }

  // remember from and to is in format Date.now()/1000
  public async getPoolsData(from: string, to: string) {
    return fetch(`https://scalpingjedi.com/JSONS/historysteps/pools_${from}_${to}.json`)
      .then(data => data.json())
      .then(data2 => data2);
  }
}
