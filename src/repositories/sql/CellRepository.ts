import { ProvideSingleton, inject } from '../../ioc';
import { BaseRepository } from './BaseRepository';
import { ICellModel, CellFormatter } from '../../models';
import { CellEntity } from './entities';

@ProvideSingleton(CellRepository)
export class CellRepository extends BaseRepository<ICellModel> {
  protected formatter: any = CellFormatter;
  protected logging: false | Function = false;

  constructor(@inject(CellEntity) protected entityModel: CellEntity) {
    super();
  }
}
