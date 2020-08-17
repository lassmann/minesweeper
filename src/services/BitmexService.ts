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

  // startTime and endtime should be like `2020-07-09T14:56`
  // binSize Available options: [1m,5m,1h,1d].
  public async  getBitmexCandles(binSize, startTime?, endTime?) {
    // let url = `https://www.bitmex.com/api/v1/trade/bucketed?binSize=${binSize}&partial=true&symbol=XBTUSD&count=1000&reverse=true`;
    let url = `https://www.bitmex.com/api/v1/trade/bucketed?binSize=${binSize}&symbol=XBTUSD&count=1000&reverse=false`;
    if (startTime) url = `${url}&startTime=${startTime}`;
    if (endTime) url = `${url}&endTime=${endTime}`;
    const res = await this.get(url);
    return JSON.parse(res);
  }

  public async getScalpingJediPools() {
    const res = await this.get(`https://scalpingjedi.com/JSONS/poolsdata_step_5.json?nocache=${Date.now()}`);
    return JSON.parse(res);
  }

  public async getBitcoinPrice() {
    const res = await this.get('https://www.bitmex.com/api/v1/trade/bucketed?binSize=1m&partial=true&count=1&reverse=true&symbol=XBTUSD');
    const parsedRes = JSON.parse(res);
    return parsedRes[0].close;
  }

  public async getFalconStatus() {
    const res = await this.get('https://scalpingjedi.com/JSONS/hf_status_falcon.json?1593607458670');
    return JSON.parse(res);
  }

  // remember from and to is in format Date.now()/1000
  public async getPoolsData(from: string, to: string) {
    return fetch(`https://scalpingjedi.com/JSONS/historysteps/pools_${from}_${to}.json`)
      .then(data => data.json())
      .then(data2 => data2);
  }
}
