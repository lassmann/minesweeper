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
  public async  getBitmexCandles(binSize, startTime?, endTime?, reverse: boolean = true) {
    // let url = `https://www.bitmex.com/api/v1/trade/bucketed?binSize=${binSize}&partial=true&symbol=XBTUSD&count=1000&reverse=true`;
    let url = `https://www.bitmex.com/api/v1/trade/bucketed?binSize=${binSize}&symbol=XBTUSD&count=1000`;
    if (reverse) url = `${url}&reverse=${reverse}`;
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

  public async getChartPresionData() {
    const res = await this.get('https://scalpingjedi.com/JSONS/chart_presion_data.json');
    return JSON.parse(res);
  }

  public async  getHFStatusFalcon() {
    const res = await this.get('https://scalpingjedi.com/JSONS/hf_status_falcon.json');
    return JSON.parse(res);
  }

  public async  getHFForceHistoric() {
    const res = await this.get('https://scalpingjedi.com/JSONS/hf_force_historic.json');
    return JSON.parse(res);
  }

  // https://scalpingjedi.com/getFalcon.php?startdate=1599609600-1599696000&t=1600991584234
  public async  getFalcon(startdate, t) {
    const res = await this.get(`https://scalpingjedi.com/getFalcon.php?startdate=${startdate}&t=${t}`);
    return JSON.parse(res);
  }

  // https://scalpingjedi.com/JSONS/chartpresion_nextstep.json
  public async  chartpresionNextstep() {
    const res = await this.get(`https://scalpingjedi.com/JSONS/chartpresion_nextstep.json`);
    return JSON.parse(res);
  }

  // https://scalpingjedi.com/JSONS/lastkill.json
  public async  getLastkill() {
    const res = await this.get(`https://scalpingjedi.com/JSONS/lastkill.json`);
    return JSON.parse(res);
  }

  // https://scalpingjedi.com/JSONS/historial_liquidacion.json
  public async  getHistorialLiquidacion() {
    const res = await this.get(`https://scalpingjedi.com/JSONS/historial_liquidacion.json`);
    return JSON.parse(res);
  }

  // https://scalpingjedi.com/JSONS/bigorders_data_0.json
  public async  getBigOrders() {
    const res = await this.get(`https://scalpingjedi.com/JSONS/bigorders_data_0.json`);
    return JSON.parse(res);
  }

  // https://scalpingjedi.com/JSONS/power_nextstep.json
  public async  getPowerNextstep() {
    const res = await this.get(`https://scalpingjedi.com/JSONS/power_nextstep.json`);
    return JSON.parse(res);
  }

  // https://scalpingjedi.com/JSONS/power_data_0.json
  public async  getPowerData() {
    const res = await this.get(`https://scalpingjedi.com/JSONS/power_data_0.json`);
    return JSON.parse(res);
  }
}
