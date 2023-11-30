# nest-crud
An abstraction layer that implements TypeORM and Repository pattern, to create core controllers for Nestjs

Nowadays we're spending too much time to create core controllers called CRUD controller. 
To prevent this, we can use **nest-crud** abstraction layer.

```bash
npm install nest-crud-abstraction
```

# Sample Project
To see how to use `nest-crud-abstraction` package, please refer to the sample folder in the root of the project. Then run following;

```bash
//docker-compose.yml

docker-compose docker-compose --env-file .env.dev up
```

```bash
//package.json

npm run start:dev
```

# At a glance

## 1. Entities & Data Transfer Objects

First we'll need an entity and a DTO like below. 

We'll use that entity clas for database related developments and DTO class will be in charge of request&response body.

Each entity must implement `AbstractEntity` class and each DTO must implement `AbstractDTO` class.

```typescript
//cat.entity.ts

import AbstractEntity from 'nest-crud-abstraction/dist/model/AbstractEntity';
import {Column, Entity} from 'typeorm';

@Entity({name: 'cats'})
export default class CatEntity extends AbstractEntity {
    @Column({name: 'breed'})
    private _breed: string;

    @Column({name: 'color'})
    private _color: string;


   // Getters & setters
}
```

```typescript
//cat.dto.ts

import AbstractDTO from 'nest-crud-abstraction/dist/payload/AbstractDTO';

export default class CatDto extends AbstractDTO {
    private _breed: string;
    private _color: string;

    // Getters & setters
}

```

# 2. Services for Business Logic
Each controller we develop will depend on a service class.
This classes will be in charge of executing all business logic as usual in `Nestjs`.

Each service must implement generic `AbstractCrudService<T, D>` class.

First type have to be an entity and second one is a DTO.

nest-crud service abstraction has two abstract methods called `getRepository` & `getMapper`.

##### getRepository()
nest-crud uses TypeORM repository pattern under the hood. 

That's why you will need to create a repository as in constructor below and will to pass it to AbstractService layer by overriding this method.


##### getMapper()
We wouldn't want to pass entity objects on rest layer, would we ?

If we agreed on this, we will need to create a mapper object that extends `AbstractMapper`.

```typescript
// cat.mapper.ts
import AbstractMapper from "nest-crud-abstraction/dist/mapper/AbstractMapper";

@Injectable()
export default class CatMapper extends AbstractMapper<CatEntity, CatDto> {
    toDTO(entity: CatEntity): CatDto {
        const sampleDTO = new CatDto();

        sampleDTO.breed = entity.breed;
        sampleDTO.color = entity.color;

        return sampleDTO;
    }

    toEntity(dto: CatDto): CatEntity {
        const sampleEntity = new CatEntity();

        sampleEntity.breed = dto.breed;
        sampleEntity.color = dto.color;

        return sampleEntity;
    }
}
```

The last thing that we implement is CatService as below.

```typescript
//cat.service.ts

import AbstractCrudService from 'nest-crud-abstraction/dist/service/AbstractCrudService';
import AbstractMapper from "nest-crud-abstraction/dist/mapper/AbstractMapper";

@Injectable()
export class CatService extends AbstractCrudService<CatEntity, CatDto> {
    constructor(
        @InjectRepository(CatEntity) private usersRepository: Repository<CatEntity>,
        private readonly catMapper: CatMapper,
    ) {
        super();
    }

    protected getRepository(): any {
        return this.usersRepository;
    }

    protected getMapper(): AbstractMapper<CatEntity, CatDto> {
        return this.catMapper;
    }
    
    // Your custom logic apart from core controllers.
}


```


If everything well up to now, we can create our core controllers.

# Core Controllers

You can create your controller structure like Nest-style, there is only one difference. This controller should have implement `AbstractController<T,D>`

##### getService()

This method will pass your service component to AbstractController to create our core controllers.

```typescript
@Controller('/cats')
export class CatController extends AbstractController<CatEntity, CatDto> {
    constructor(
        private readonly appService: CatService
    ) {
        super();
    }

    protected getService(): AbstractCrudService<CatEntity, CatDto> {
        return this.appService;
    }
}
```

# Conclusion

If you run your application you should see below output that describes our mapped endpoints.

```bash
[Nest] 52991  - 11/06/2023, 5:42:00 PM     LOG [NestFactory] Starting Nest application...
[Nest] 52991  - 11/06/2023, 5:42:00 PM     LOG [InstanceLoader] AppModule dependencies initialized +49ms
[Nest] 52991  - 11/06/2023, 5:42:00 PM     LOG [InstanceLoader] TypeOrmModule dependencies initialized +0ms
[Nest] 52991  - 11/06/2023, 5:42:00 PM     LOG [InstanceLoader] TypeOrmCoreModule dependencies initialized +71ms
[Nest] 52991  - 11/06/2023, 5:42:00 PM     LOG [InstanceLoader] TypeOrmModule dependencies initialized +0ms
[Nest] 52991  - 11/06/2023, 5:42:00 PM     LOG [InstanceLoader] CatsModule dependencies initialized +0ms
[Nest] 52991  - 11/06/2023, 5:42:00 PM     LOG [RoutesResolver] CatController {/cats}: +7ms
[Nest] 52991  - 11/06/2023, 5:42:00 PM     LOG [RouterExplorer] Mapped {/cats, GET} route +1ms
[Nest] 52991  - 11/06/2023, 5:42:00 PM     LOG [RouterExplorer] Mapped {/cats/:id, GET} route +1ms
[Nest] 52991  - 11/06/2023, 5:42:00 PM     LOG [RouterExplorer] Mapped {/cats/:id, GET} route +0ms
[Nest] 52991  - 11/06/2023, 5:42:00 PM     LOG [RouterExplorer] Mapped {/cats/:id, DELETE} route +0ms
[Nest] 52991  - 11/06/2023, 5:42:00 PM     LOG [NestApplication] Nest application successfully started +1ms
```