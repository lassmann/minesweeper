import { Request } from 'express';
import * as multer from 'multer';
import * as hash from 'object-hash';
import * as moment from 'moment';

export const safeParse = (str: string, fallback: any = undefined) => {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
};

export const isId = (key: string): boolean => key === 'id' || /_id$/.test(key) || /Id$/.test(key);

export const defaultFormatter = (key: string, value: any) => {
  if (isId(key)) return value;
  value = safeParse(value, value);
  if (typeof value === 'string') return new RegExp(value, 'i');
  return value;
};

export const debounce = (fn, delayTime: number) => {
  let timerId;
  return (...args) => {
    if (timerId) clearTimeout(timerId);
    timerId = setTimeout(() => {
      fn(...args);
      timerId = null;
    }, delayTime);
  };
};

export const throttle = (fn, delayTime: number) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, delayTime);
    }
  };
};

export const cleanQuery = (
  query: string | any = '',
  customFormatter?: (key: string, value: any) => any
): { [key: string]: any } => {
  if (typeof query !== 'string') return query instanceof Object ? query : {};

  const parsedQuery = safeParse(query, {});

  return Object.keys(parsedQuery)
    .map(key => [key, parsedQuery[key]])
    .reduce((fullQuery, queryChunk) => {
      const key: string = queryChunk[0];
      const value: any = (customFormatter || defaultFormatter)(key, queryChunk[1]);

      if (key && value !== undefined) fullQuery[key] = value;

      return fullQuery;
    }, {});
};

export const parseMultiPartRequest = async (request: Request): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    multer().any()(request, undefined, async (error) => {
      if (error) reject(error);
      resolve();
    });
  });
};

export const isAcronym = (str: string): boolean => {
  if (typeof str !== 'string') return false;
  return str.toUpperCase() === str;
};

export const generateAcronym = (full: string): string => {
  const wordsToOmit = ['of', 'the', 'a', 'an'];
  if (!full || typeof full !== 'string') return null;
  full = full.split('/')[0];
  if (typeof full !== 'string') return null;
  while (full.includes('_')) full = full.replace('_', ' ');
  while (full.includes('-')) full = full.replace('-', ' ');
  while (full.includes('.')) full = full.replace('.', ' ');
  if (isAcronym(full)) return full.trim().split(' ').filter(Boolean).join('');
  if (full.trim().split(' ').length === 1 && full.trim().length >= 2) return `${full.trim().substring(0, 2).toUpperCase()}`;
  return full.trim().split(' ')
    .filter(Boolean)
    .filter((part, index) => !wordsToOmit.find(w => w === part.toLowerCase()) || !index)
    .map(part => part.charAt(0).toUpperCase())
    .join('');
};

export const getHashFromId = (_id: string): string => {
  return hash({ _id });
};

export const wait = timeout => new Promise(resolve => setTimeout(resolve, timeout));

export const memorize = <T>(fn: T, maxCacheSize: number = 500, cacheDuration: number = 0) => {
  let cache: { [key: string]: any } = {};
  if (cacheDuration) setInterval(() => cache = {}, cacheDuration);
  return function (...args: any[]) { // tslint:disable-line
    const key: string = JSON.stringify(args);
    if (cache[key] !== (void 0)) return cache[key];
    try {
      return cache[key] = (fn as any)(...args);
    } finally {
      const keys = Object.keys(cache);
      if (keys.length > maxCacheSize) delete cache[keys[0]];
    }
  } as any;
};

export const isWeekend = (date: moment.Moment): boolean => {
  const day = date.get('day');
  return day === 6 || day === 0;
};

export const isSameDay = (start: moment.Moment, end: moment.Moment): boolean => end.year() === start.year() && end.dayOfYear() === start.dayOfYear();

export const getDatesBetween = (start: moment.Moment, end: moment.Moment): moment.Moment[] => {
  start = start.clone();
  end = end.clone();
  const days = [];
  while (!isSameDay(start, end)) {
    days.push(end.clone()); /** THIS is the right order, first push and then substract */
    end.subtract(1, 'day');
  }
  /** remove the first result cause it doesn't count. it's not a day in between, but the end day */
  return days.slice(1, days.length).reverse();
};

export const normalizeBusinessDate = (date: moment.Moment): moment.Moment => {
  const top = date.clone().set('hours', 18).set('minutes', 30).set('seconds', 0).set('milliseconds', 0);
  const bottom = date.clone().set('hours', 8).set('minutes', 0).set('seconds', 0).set('milliseconds', 0);
  if (date.isAfter(top)) return top;
  if (date.isBefore(bottom)) return bottom;
  return date.clone();
};

export const fitIntoSortedNumberList = (num: number, limitList: number[]): number => {
  for (let limit of limitList) if (num <= limit) return limit;
  return null;
};

export const sumArray = (numArray: number[]) => numArray.reduce((total, curr) => total + curr, 0);

export const businessTimeDiff = (start: moment.Moment, end: moment.Moment): moment.Duration => {
  start = normalizeBusinessDate(start);
  end = normalizeBusinessDate(end);
  const weekendDayMs: number = 24 * 60 * 60 * 1000;
  const businessDayMs: number = (24 - 9) * 60 * 60 * 1000;
  const isTheSameDay: boolean = isSameDay(start, end);
  const head: number = 9 * 60 * 60 * 1000; // remove from first 9hs from end date
  const tail: number = 6 * 60 * 60 * 1000; // remove last hs after 6pm from start date
  const daysInBetween: moment.Moment[] = getDatesBetween(start, end);
  let msToRemove: number = 0; /** MS inside timeframe that are NOT business hours to remove from the diff */
  msToRemove = daysInBetween.reduce((ms, day) => isWeekend(day) ? ms + weekendDayMs : ms + businessDayMs, msToRemove);
  if (!isTheSameDay) msToRemove = msToRemove + head + tail;
  return moment.duration((end.subtract(msToRemove, 'milliseconds')).diff(start));
};

export const getAvgGroups = (list: number[], groupCount: number = 3) => {
  const max: number = Math.max(...list);
  const min: number = Math.min(...list);
  const diff: number = max - min;
  const segmentSize: number = diff / groupCount;
  const segmentLimits: number[] = Array.from(Array(groupCount - 1))
    .reduce((total) => total.concat(total[total.length - 1] - segmentSize), [max]) // [300, 200, 100]
    .reverse(); // smaller first
  const segmentMapBase = segmentLimits.reduce((total, curr) => ({ ...total, [curr]: [] }), {}); // base for segment map
  const segmentMapRaw = list // segment map with segments of the same size
    .reduce((total, curr) => {
      const fit = fitIntoSortedNumberList(curr, segmentLimits);
      return { ...total, [fit]: total[fit].concat([curr]) };
    }, segmentMapBase);
  const preciseSegmentMap = Object.entries<number[]>(segmentMapRaw) // segment map with segments of miningful sizes (not equal)
    .reduce((total, [_, valueList]) => ({ ...total, [sumArray(valueList) / valueList.length]: valueList }), {});
  const segmentMap = Object.entries<number[]>(preciseSegmentMap) // segment map with averages
    .reduce((total, [key, valueList]) => (isNaN(key as any) ? total : { ...total, [key]: valueList.length * 100 / list.length }), {});
  /** (isNaN(key as any) filters divisions by 0 NaNs */
  const averageList = Object.entries<number>(segmentMap)
    .reduce((total, [key, value]) => [...total, { percentage: value, avgMinutes: Number(key) }], []); // inverting key(min)/value(%)
  return averageList;
};

export const getPercentageFromNumberObj = (obj: { [key: string]: number }) => {
  const totalSum = sumArray(Object.values(obj));
  return Object.entries<number>(obj).reduce((total, [key, value]) => ({ ...total, [key]: value * 100 / totalSum }), {});
};

export const delay = (fn, delayTme: number): (...args: any[]) => Promise<any> => {
  let lastRun = Date.now();
  return (...args) => {
    return new Promise((resolve, reject) => {
      const nextRun = Math.max(Date.now(), lastRun) + delayTme;
      const nextRunDelay = nextRun - Date.now();
      lastRun = nextRun;
      setTimeout(() => {
        const res = fn(...args);
        if (res instanceof Promise) res.then(resolve, reject);
        else resolve(res);
      }, nextRunDelay);
    });
  };
};

export const splitArrayChunk = <T>(array: T[], chunkSize: number = 1): T[][] =>
  array.map((_, i) => i % chunkSize === 0 ? array.slice(i, i + chunkSize) : undefined).filter(c => c !== undefined);
