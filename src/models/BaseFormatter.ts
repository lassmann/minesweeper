import { safeParse } from '../utils';
import { ImmutabilityHelper } from '../utils';

export abstract class BaseFormatter {
  public _id: string;
  public metadata?: any;
  public createdAt?: Date;
  public updatedAt?: Date;
  public deletedAt?: Date;

  protected format(args: any = {}, props: any = {}): any {
    if (typeof args.toJSON === 'function') args = args.toJSON();
    else args = JSON.parse(JSON.stringify(args));
    Object.keys(this).forEach(key => {
      if (args[key] !== undefined) this[key] = ImmutabilityHelper.copy(args[key]);
    });
    if (args._id) this._id = args._id;
    ['createdAt', 'updatedAt', 'deletedAt'].forEach(p => {
      if (typeof args[p] === 'string') this[p] = args[p];
      else if (args[p] instanceof Date) this[p] = args[p].toISOString();
    });
    if (typeof args.metadata === 'string') this.metadata = safeParse(args.metadata, args.metadata);
    return args;
  }
}
