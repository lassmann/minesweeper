import { decorate, injectable } from 'inversify';

import constants from '../config/constants';
import { ApiError } from '../config/ErrorHandler';
import { PaginationModel } from '../models';
import { BaseRepository, ISecurityPayload } from '../repositories/sql/BaseRepository';

export abstract class BaseService<EntityModel> {
  public repository: BaseRepository<EntityModel>;

  public async getById(_id: string, securityPayload?: ISecurityPayload): Promise<EntityModel> {
    return this.repository.findOne({ _id }, securityPayload);
  }

  public async findOne(query: any, securityPayload?: ISecurityPayload): Promise<EntityModel> {
    return this.repository.findOne(query, securityPayload);
  }

  public async getPaginated(
    page: number,
    limit: number,
    fields: string,
    sort: string,
    query: string,
    orFields: string,
    securityPayload?: ISecurityPayload
  ): Promise<PaginationModel> {
    const skip: number = (Math.max(1, page) - 1) * limit;
    const fieldArray = (fields || '').split(',').map(field => field.trim()).filter(Boolean);
    const orFieldArray = (orFields || '').split(',').map(field => field.trim()).filter(Boolean);
    let [count, docs] = await Promise.all([
      this.repository.count(query, orFieldArray, securityPayload),
      this.repository.find(skip, limit, sort, query, fieldArray, orFieldArray, securityPayload)
    ]);
    if (fieldArray.length) docs = docs.map(
      doc => fieldArray.reduce<any>((total, curr) => ({ ...total, [curr]: doc[curr] }), { _id: (doc as any)._id })
    );
    return new PaginationModel({
      count,
      page,
      limit,
      docs,
      totalPages: Math.ceil(count / limit),
    });
  }

  public async create(entity: EntityModel): Promise<EntityModel> {
    const res = await this.repository.create(entity);
    return this.getById((res as any)._id);
  }

  public async dirtyCreate(entity: EntityModel): Promise<EntityModel> {
    const res = await this.repository.dirtyCreate(entity);
    return this.getById((res as any)._id);
  }

  public async update(id: string, entity: EntityModel, securityPayload?: ISecurityPayload): Promise<EntityModel> {
    await this.repository.update(id, entity, securityPayload);
    return this.getById(id);
  }

  public async updateWhere(entity: EntityModel, query: any, securityPayload?: ISecurityPayload): Promise<void> {
    await this.repository.updateWhere(entity, query, securityPayload);
  }

  public async findAll(securityPayload?: ISecurityPayload): Promise<EntityModel[]> {
    return this.repository.findAll(securityPayload);
  }

  public async patch(id: string, entity: EntityModel & any, securityPayload?: ISecurityPayload): Promise<void> {
    return this.repository.patch(id, entity, securityPayload);
  }

  public async delete(id: string, securityPayload?: ISecurityPayload): Promise<void> {
    const res = await this.repository.delete(id, securityPayload);
    if (!res.n) throw new ApiError(constants.errorTypes.notFound);
  }

}

decorate(injectable(), BaseService);
