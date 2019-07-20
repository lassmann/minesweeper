# OPYA RESTful


This section contains a guide of what we use to generate the application in the Back-End
- We use Typescript and Javascript2015 ([ECMAScript 6](http://es6-features.org/#Constants)) to write the code. You can read about the standards we follow in this link [code-style-guide](https://github.com/MakingSense/code-style-guides/blob/master/Javascript(ES6)/README.md).

* This project includes the following features:
* *  [tsoa](https://www.npmjs.com/package/tsoa) `typescript`
* * [inversify](https://www.npmjs.com/package/inversify) `inversion of controll / dependency injection`
* * [swagger-ui-express](https://www.npmjs.com/package/swagger-ui-express)
* * [mongoose](https://www.npmjs.com/package/mongoose) `MongoDB ORM`
* * [sequelize](https://www.npmjs.com/package/sequelize) `SQL ORM`
* * [mocha](https://www.npmjs.com/package/mocha), [chai](https://www.npmjs.com/package/chai), [supertest](https://www.npmjs.com/package/supertest), [sinon](https://www.npmjs.com/package/sinon) `unit and integration testing`

### Standards
- Git Flow, please read [git-workflow](https://github.com/MakingSense/development-guidelines/blob/master/git-workflow/README.md).
- Code reviews template. This is a standard format:

If any field below is not needed, keep the title and use N/A as message body.
```
## Background
_(Explain what was the problem, what decisions you took to solve them.)_
## Changes done
_(Enumerate changes done, that are not obvious from the contents of the code. Explain only general approaches to the changes. Explain design decisions if any.)_
## Pending to be done
_(Enumerate known pending tasks and why they weren't addressed here.)_
## Notes
_(Optional. Any additional notes that will help reviewers understand the PR.)_
```

## Swagger
* `<url>/api-docs`
### Field Examples
* `sort` \<endpoint\>?sort=**{"field":"asc","field_2":"desc"}**
* `fields` \<endpoint\>?fields=**field,field_2**
* `orFields` \<endpoint\>?orFields=**field,field_2** `this fields will be added as AND (field... OR field_2...) conditions to complement the q param`
* `q` \<endpoint\>?q=**{"field":"single_value","field_2":["value_1","value_2"]}**
* * `{"field": value}` means field equals value or is like value in the case of strings
* * `{"field": [value, value_2]}` means field equals value OR field equals value_2
* * `{"field$ex": value}` means field exactly equals value even if value is a string
* * `{"field$!": }` means field does `NOT` equal value
* * `{"field$gt": }` means field id `GREATER` than value
* * `{"field$ls": }` means field id `LESS` than value

## Commands
* **installation:** `yarn install`
* **dev:** `yarn start:local` *build tsoa routes, swagger definitions and starts the server on development mode listening to file changes (swagger definition changes will require a manual restart)*
* **test:** `yarn test` *unit and integration tests*
* **build:** `yarn build` *production build*
* **prod:** `NODE_ENV=<env> yarn start` *starts the server on production mode*

## Scaffolding
* config `express server, DB connection, Logger, etc`
* * env `.env files`
* controllers `routes configuration`
* models `classes and interfaces representing entities. They are also used to normalize data`
* respositories `data abstraction layers`
* * mongo `mongo repos`
* * sql `sql repos`
* services `business logic to be used primary by controllers`
* setup `migrations and seeds for all dbs`
* utils
* tests
* * data `mock data`
* * integration
* * unit
* * * mocks `testing helpers`


## Code Examples

### Controller
* Controllers handle routes configuration including:
* * paths / methods
* * auth roles
* * swagger definitions
```typescript
import { Route, Controller, Get } from 'tsoa';

import { ProvideSingleton } from '../ioc';

@Route('ping')
@ProvideSingleton(PingController)
export class PingController extends Controller {
  /** The service containing business logic is passed through dependency injection */
  constructor(@inject(UserService) private userService: UserService) {
    super();
  }

  /** Simple GET */
  @Get()
  public async ping(): Promise<string> {
    return 'pong';
  }

  /** Error response definition for swagger */
  @Response(400, 'Bad request')
  @Post()
  /** Type of security needed to access the method */
  @Security('adminUser')
  /** The request's body is accessed through a decorator */
  /** The interface "IUserModel" is also used to build swagger specs and to perform run time validations */
  public async create(@Body() userParams: IUserModel): Promise<IUserModel> {
    const user = new UserModel(userParams);
    return this.userService.create(user);
  }
}
```

### Models and Formatters
* Models and Formatters are used for 4 reasons:

#### Model
* * **Swagger** definition file
* * Run time validations performed by **tsoa**
* * Static typing advantages
```typescript
/** An interface used for swagger, run time validations and standar typescript advantages */
export interface IUserModel {
  id?: string;
  username: string;
  firstName: string;
  lastName: string;
}
```

#### Formatter
* * Data normalization
```typescript
/** A class used to normalize data */
export class UserFormatter extends BaseFormatter implements IUserModel {
  public username: string = undefined;
  public firstName: string = undefined;
  public lastName: string = undefined;

  constructor(args: any) {
    super();
    args = this.format(args);
  }
}
```

### Auth
* A simple **tsoa** middleware to handle authentication by decorators.
#### Auth on controller
```typescript
class SomeController {
  @Post()
  @Security('authRole')
  public async method(): Promise<IUserModel> {
    // ...
  }
}
```
#### Auth logic implementation
```typescript
export async function expressAuthentication(request: Request, securityName: string, scopes?: string[]): Promise<AuthData> {
  /** Switch to handle security decorators on controllers - @Security('adminUser') */
  switch (securityName) {
    case 'authRole':
      /** If auth is valid, returns data that might be used on controllers (maybe logged user's data) */
      return null;
  }
  /** Throws an exception if auth is invalid */
  throw new ApiError('auth', 403, 'invalid credentials');
}
```

### Service
* Services encapsulate bussiness logic to be used by controllers. This allows the code to stay **DRY** if several controllers rely on similar logic and help to make testing easier.
```typescript
@ProvideSingleton(UserService)
export class UserService {
  /** The repository to access the data persistance layer is passed through dependency injection */
  constructor(@inject(UserRepository) private userRepository: UserRepository) { }

  /** Business logic to get a single item */
  public async getById(_id: string): Promise<IUserModel> {
    return new UserModel(await this.userRepository.findOne({ _id }));
  }

  /** Business logic to get paginated data */
  public async getPaginated(query: IUserModel, pageNumber: number, perPage: number): Promise<PaginationModel> {
    const skip: number = (Math.max(1, pageNumber) - 1) * perPage;
    const [count, list] = await Promise.all([
      this.userRepository.count(query),
      this.userRepository.find(query, skip, perPage)
    ]);
    return new PaginationModel({
      count,
      pageNumber,
      perPage,
      list: list.map(item => new UserModel(item))
    });
  }
}
```

### Repositories
* Repositories handle the access to data layers

#### Mongo Repository
```typescript
@ProvideSingleton(UserService)
import { Schema, Model } from 'mongoose';

import { BaseRepository } from './BaseRepository';
import { ProvideSingleton, inject } from '../../ioc';
import { MongoDbConnection } from '../../config/MongoDbConnection';
import { ICaseModel, CaseFormatter } from '../../models';

@ProvideSingleton(CaseRepository)
export class CaseRepository extends BaseRepository<ICaseModel> {
  protected modelName: string = 'cases';
  protected schema: Schema = new Schema({
    name: { type: String, required: true },
    createdBy: { type: String, required: true }
  });
  protected formatter = CaseFormatter;
  constructor(@inject(MongoDbConnection) protected dbConnection: MongoDbConnection) {
    super();
    super.init();
  }
}
```

#### SQL Repository
```typescript
import { ProvideSingleton, inject } from '../../ioc';
import { BaseRepository } from './BaseRepository';
import { ICaseModel, CaseFormatter } from '../../models';
import { CaseEntity } from './entities';

@ProvideSingleton(CaseRepository)
export class CaseRepository extends BaseRepository<ICaseModel> {
  protected formatter: any = CaseFormatter;

  constructor(@inject(CaseEntity) protected entityModel: CaseEntity) {
    super();
  }
}
```

#### SQL Entity
* * Sequelize definition to be used by SQL repositories
```typescript
import * as Sequelize from 'sequelize';

import { ProvideSingleton, inject } from '../../../ioc';
import { SQLDbConnection } from '../../../config/SQLDbConnection';
import { BaseEntity } from './BaseEntity';

@ProvideSingleton(CaseEntity)
export class CaseEntity extends BaseEntity {
  /** table name */
  public entityName: string = 'case';
  /** table definition */
  protected attributes: Sequelize.DefineAttributes = {
    _id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.UUIDV4 },
    name: { type: Sequelize.STRING, allowNull: false, unique: true },
    createdBy: { type: Sequelize.STRING, allowNull: false }
  };
  protected options: Sequelize.DefineOptions<any> = { name: { plural: 'cases' } };

  constructor(@inject(SQLDbConnection) protected sqlDbConnection: SQLDbConnection) {
    super();
    this.initModel();
  }
}
```

#### Mongo and SQL Migrations
* * When an update on a model is needed, the `Entity` on `src/repositories/sql/entities` _(on SQL)_ or `Schema` on `src/repsitories/mongo...` _(on Mongo)_ will have to be updated   and a migration file created and run with the provided npm script `migrate --env <env> --direction <direction> --action <action>` to update the already created table/schema.
#### Mongo and SQL Seeders
* * The seeders work exactly the same as migrations, the only difference will be on the seeder files.

* * Both seeds and migrations will run **all** files for the `up` direction and just the latest registered for the `down` direction. This means that it will run all up functions from the previous marker, but only the latest registered down function that has a marker.
```typescript
export const up = async () => {
  /** changes using sequelize or mongoose */
};

export const down = async () => {
  /** changes using sequelize or mongoose */
};
```

#### Sync
* * To sync all entities when the server/tests start, you will have to inject their dependencies into `SQLSetupHelper` class localted at `src/config/SQLSetupHelper`
```typescript
import * as Sequelize from 'sequelize';

import constants from './constants';
import { Logger } from './Logger';
import { ProvideSingleton, inject } from '../ioc';
import { SQLDbConnection } from './SQLDbConnection';
import * as entities from '../repositories/sql/entities';

@ProvideSingleton(SQLSetupHelper)
export class SQLSetupHelper {

  constructor(
    @inject(SQLDbConnection) private sqlDbConnection: SQLDbConnection,
    @inject(entities.UserEntity) private entity1: entities.UserEntity,
    @inject(entities.CaseEntity) private entity2: entities.CaseEntity
  ) { }

  public async rawQuery<T>(query: string): Promise<T> {
    return this.sqlDbConnection.db.query(query, { raw: true });
  }

  public async sync(options?: Sequelize.SyncOptions): Promise<void> {
    await this.sqlDbConnection.db.authenticate();
    if (constants.SQL.dialect === 'mysql') await this.rawQuery('SET FOREIGN_KEY_CHECKS = 0');
    Logger.log(
      `synchronizing: tables${options ? ` with options: ${JSON.stringify(options)}` : ''}`
    );
    await this.sqlDbConnection.db.sync(options);
  }
}
```


### Test
* Tests include **unit tests** `(utils and services)` and **integration tests**.
```typescript
import { expect } from 'chai';
import * as supertest from 'supertest';

import { Server } from '../../config/Server';

describe('PingController', () => {
  const app = supertest(new Server().app);

  it('HTTP GET /api/ping | should return pong', async () => {
    const res = await app.get('/api/ping');
    expect(res.status).to.equal(200);
    expect(res.body).to.equal('pong');
  });
});

```
