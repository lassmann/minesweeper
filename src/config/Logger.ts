import * as logger from 'winston';

import constants from './constants';

logger.configure({
  level: 'debug',
  format: logger.format.combine(logger.format.colorize(), logger.format.simple()),
  transports: [new logger.transports.Console()]
});

export class Logger {
  public static readonly shouldLog: boolean = !constants.isTest;
  public static readonly shouldTrackEvents: boolean = !constants.isTest;
  public static readonly console = logger;

  public static log(...args: any[]): void {
    if (Logger.shouldLog) Logger.console.debug(Logger.formatArgs(args));
  }

  public static warn(...args: any[]): void {
    if (Logger.shouldLog) Logger.console.warn(Logger.formatArgs(args));
  }

  public static error(...args: any[]): void {
    if (Logger.shouldLog) Logger.console.error(Logger.formatArgs(args));
  }

  public static info(...args: any[]): void {
    if (Logger.shouldLog) Logger.console.info(Logger.formatArgs(args));
  }

  public static verbose(...args: any[]): void {
    if (Logger.shouldLog) Logger.console.verbose(Logger.formatArgs(args));
  }

  private static formatArgs(args: any[]): string {
    if (args instanceof Array) args = args.map(a => a instanceof Error || a instanceof Promise ? String(a) : a);
    if (args.length <= 1) args = args[0];
    return JSON.stringify(args, null, 4);
  }

}
