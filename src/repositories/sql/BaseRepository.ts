import * as Sequelize from 'sequelize';
import { decorate, injectable } from 'inversify';

import { Logger } from '../../config/Logger';
import { ApiError } from '../../config/ErrorHandler';
import constants from '../../config/constants';
import { cleanQuery, safeParse, isId } from '../../utils';
import { BaseEntity } from './entities/BaseEntity';

export type ISecurityPayload = { [key: string]: any };

export abstract class BaseRepository<EntityType> {
  protected formatter: any = Object;
  protected formatterProps: any = {};
  protected entityModel: BaseEntity;
  protected defaultAttributes: string[] = ['_id', 'createdAt', 'updatedAt', 'deletedAt'];
  protected excludedAttrbutes: string[] = [];
  protected getInclude: Sequelize.IncludeOptions[] = [];
  protected saveInclude: Sequelize.IncludeOptions[] = [];
  private readonly fieldModifierSplitter: string = '$';
  private readonly modifierKeys = { not: '!', greaterThan: 'gt', lessThan: 'ls', exact: 'ex' };
  protected logging: false | Function = l => Logger.verbose(l);

  // tslint:disable-next-line
  protected async securityDefaultOverride(query: any, securityPayload?: ISecurityPayload): Promise<any> {
    return query;
  }

  protected async securityGetOverride(query: any, payload?: ISecurityPayload) { return this.securityDefaultOverride(query, payload); }
  protected async securityUpdateOverride(query: any, payload?: ISecurityPayload) { return this.securityDefaultOverride(query, payload); }
  protected async securityDeleteOverride(query: any, payload?: ISecurityPayload) { return this.securityDefaultOverride(query, payload); }

  public async create(model: EntityType, include = this.saveInclude): Promise<EntityType> {
    const res = await this.entityModel.model.create(this.cleanToSave(model, 'create'), { include, logging: this.logging });
    return new this.formatter(res, this.formatterProps);
  }

  public async dirtyCreate(model: EntityType, include = this.saveInclude): Promise<EntityType> {
    const res = await this.entityModel.model.create(model, { include, logging: this.logging });
    return new this.formatter(res, this.formatterProps);
  }

  public async update(_id: string, model: EntityType, securityPayload?: ISecurityPayload): Promise<void> {
    const where = await this.securityUpdateOverride({ _id: { [Sequelize.Op.eq]: _id } }, securityPayload);
    await this.entityModel.model.update(this.cleanToSave(model, 'update'), { where, logging: this.logging });
  }

  public async updateWhere(model: EntityType, query: any, securityPayload?: ISecurityPayload): Promise<void> {
    const where = await this.securityUpdateOverride(this.cleanWhere(query), securityPayload);
    await this.entityModel.model.update(this.cleanToSave(model, 'update'), { where, logging: this.logging });
  }

  public async patch(_id: string, model: EntityType & any, securityPayload?: ISecurityPayload): Promise<void> {
    const where = await this.securityUpdateOverride({ _id: { [Sequelize.Op.eq]: _id } }, securityPayload);
    const fields: string[] = Object.keys(model);
    await this.entityModel.model.update(this.cleanToSave(model, 'update'), { where, fields, logging: this.logging });
  }

  public async dirtyUpdate(_id: string, model: EntityType): Promise<void> {
    await this.entityModel.model.update(model, { where: { _id }, logging: this.logging });
  }

  public async updateMany(model: EntityType, query: any, fields?: string[]): Promise<void> {
    await this.entityModel.model.update(
      this.cleanToSave(model, 'update'),
      { where: this.cleanWhere(query), fields, logging: this.logging, silent: true }
    );
  }

  public async delete(_id: string, securityPayload?: ISecurityPayload): Promise<{ n: number }> {
    const where = await this.securityDeleteOverride({ _id: { [Sequelize.Op.eq]: _id } }, securityPayload);
    const n = await this.entityModel.model.destroy({ where, logging: this.logging });
    return { n };
  }

  public async deleteMany(query: any): Promise<{ n: number }> {
    const n = await this.entityModel.model.destroy({ where: this.cleanWhere(query), logging: this.logging });
    return { n };
  }

  public async find(
    offset: number = 0,
    limit: number = 250,
    sort: string,
    query: any,
    attributes: string[] = [],
    orFields: string[] = [],
    securityPayload?: ISecurityPayload,
    include = this.getInclude
  ): Promise<EntityType[]> {
    const sortObject = this.cleanSort(sort);
    const order = Object.keys(sortObject).map(key => [key, sortObject[key]]);
    const where = await this.securityGetOverride(this.cleanWhere(query, orFields), securityPayload);
    const options: Sequelize.FindOptions<any> = {
      include,
      where,
      limit,
      offset,
      logging: this.logging
    };
    if (order) options.order = order;
    if (attributes.length) options.attributes = Array.from(new Set(
      attributes.concat(this.defaultAttributes).filter(attr => !this.excludedAttrbutes.find(ex => ex === attr))
    ));
    return (await this.entityModel.model.findAll(options))
      .map(item => new this.formatter(item, this.formatterProps));
  }

  public async findAll(securityPayload?: ISecurityPayload): Promise<EntityType[]> {
    const where = await this.securityGetOverride(this.cleanWhere(''), securityPayload);
    return (await this.entityModel.model.findAll({ where, logging: this.logging })).map(item => new this.formatter(item, this.formatterProps));
  }

  public async findOne<T>(where: any,
    securityPayload?: ISecurityPayload,
    attributes: string[] = null,
    include = this.getInclude): Promise<EntityType> {
    where = await this.securityGetOverride(where, securityPayload);
    const res = await this.entityModel.model.findOne({ where, include, attributes, logging: this.logging });
    if (!res) throw new ApiError(constants.errorTypes.notFound);
    return new this.formatter(res, this.formatterProps);
  }

  public async count(query: any, orFields: string[] = [], securityPayload?: ISecurityPayload): Promise<number> {
    const where = await this.securityGetOverride(this.cleanWhere(query, orFields), securityPayload);
    return this.entityModel.model.count({ where, logging: this.logging });
  }

  public async bulkWrite(entities: EntityType[]): Promise<EntityType[]> {
    return this.entityModel.model.bulkCreate(entities, { logging: this.logging });
  }

  public async checkUnique(field: string, value: any): Promise<boolean> {
    const count = await this.entityModel.model.count({ where: { [field]: { [Sequelize.Op.iLike]: value } }, logging: this.logging });
    return !!count;
  }

  protected cleanToSave(entity: EntityType, operation?: string): EntityType {
    if (operation === 'create') {
      delete (entity as any)._id;
      delete (entity as any).id;
    }
    const copy: EntityType = new this.formatter(entity, this.formatterProps);
    const loop = (value: any, key?: string, ref?: any): any => {
      if (key && !!['createdAt', 'updatedAt', 'deletedAt'].find(p => p === key)) return delete ref[key];
      if (!value || typeof value !== 'object') return;
      Object.keys(value).forEach(k => loop(value[k], k, value));
    };
    loop(copy);
    return copy;
  }

  protected sortQueryFormatter(key: string, value: string): string | undefined {
    if (value === 'asc') return 'asc';
    if (value === 'desc') return 'desc';
    return undefined; // just for static typing
  }

  protected whereQueryFormatter = (rawKey: string, rawValue: any): any => {
    const [key, modifier] = rawKey.split(this.fieldModifierSplitter);
    const keyIsId = isId(key);
    let value = safeParse(rawValue, rawValue);
    if (typeof value !== 'object') value = rawValue;
    if (value instanceof Array) return { [Sequelize.Op.or]: value.map(v => this.whereQueryFormatter(rawKey, v)) };
    const isValueLike: boolean = typeof value === 'string' && !keyIsId && modifier !== this.modifierKeys.exact;
    const modifIsNot: boolean = modifier === this.modifierKeys.not;

    let operator = isValueLike ? Sequelize.Op.iLike : Sequelize.Op.eq;
    if (modifIsNot) operator = isValueLike ? Sequelize.Op.notLike : Sequelize.Op.ne;
    else if (modifier === this.modifierKeys.greaterThan) operator = Sequelize.Op.gt;
    else if (modifier === this.modifierKeys.lessThan) operator = Sequelize.Op.lt;

    if (typeof value === 'boolean') value = value.toString();
    return { [operator]: isValueLike ? `%${value}%` : value };
  }

  protected cleanSort(sort: string): { [key: string]: any } {
    return cleanQuery(sort, this.sortQueryFormatter);
  }

  protected cleanWhere(query: any, orFields: string[] = []): { [key: string]: any } {
    const orSymbol: any = Sequelize.Op.or;
    const where = cleanQuery(query, this.whereQueryFormatter);
    for (const key of Object.keys(where)) {
      let cleanKey = key.split(this.fieldModifierSplitter)[0];
      where[cleanKey] = where[key];
      if (cleanKey !== key) delete where[key];
    }
    for (const orField of orFields) {
      if (!where[orField]) continue;
      where[orSymbol] = where[orSymbol] || [];
      where[orSymbol] = [...where[orSymbol], { [orField]: where[orField] }];
      delete where[orField];
    }
    return where;
  }
}

decorate(injectable(), BaseRepository);
