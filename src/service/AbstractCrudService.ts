import { BadRequestException } from "@nestjs/common";
import { Filter, Order, Pagination, SearchQuery } from "src/payload/Filter";
import { Between, Equal, ILike, In, LessThan, LessThanOrEqual, Like, MoreThan, MoreThanOrEqual, Not, Repository } from "typeorm";
import AbstractMapper from "../mapper/AbstractMapper";
import AbstractEntity from "../model/AbstractEntity";
import AbstractDTO from "../payload/AbstractDTO";
import AbstractService from "./AbstractService";

export default abstract class AbstractCrudService<
  T extends AbstractEntity,
  D extends AbstractDTO,
> extends AbstractService<T> {

  protected abstract getRepository(): Repository<T>;

  protected abstract getMapper(): AbstractMapper<T, D>;

  async create(dto: D) {
    const t = this.getMapper().toEntity(dto);

    await this.getRepository().save(t);

    return dto;
  }

  async findAll(query: string): Promise<T[]> {
    console.log(query);

    if (!query) {
      return await this.getRepository().find();
    }

    //@ts-ignore
    this.getRepository().findBy({})

  }

  async findOne(_id: number): Promise<D | null> {
    // @ts-ignore
    const entity = await this.getRepository().findOneBy({ _id });

    super.isEntityExists(entity);

    return this.getMapper().toDTO(entity);
  }

  async update(_id: number, dto: D) {
    // @ts-ignore
    const entity = await this.getRepository().findOneBy({ _id });

    super.isEntityExists(entity);

    const t = this.getMapper().toEntity(dto);
    // @ts-ignore
    await this.getRepository().update(_id, t);

    return dto;
  }

  async remove(_id: number) {
    // @ts-ignore
    const entity = await this.getRepository().findOneBy({ _id });

    super.isEntityExists(entity);

    return await this.getRepository().delete(_id);
  }

  async filter(filter: Filter) {
    const options = this.createFindOptions(
      filter.filters,
      filter.order,
      filter.pagination,
      filter.logic,
    );

    let result = null;
    try {
      result = await this.getRepository().find(options);
    } catch (error) {
      throw new BadRequestException('Query Error', {
        cause: error,
        description: error.message,
      });
    }

    return result;
  }

  private createFindOptions(
    filters: SearchQuery | SearchQuery[],
    order: Order[],
    pagination: Pagination,
    logic: string,
  ) {
    let where = undefined;

    if (filters) {
      where = this.createClause(filters, logic);
    }

    let orderBy = undefined;
    if (order) {
      orderBy = this.createOrderClause(order);
    }

    const clause = {
      where: where,
      order: orderBy,
    };

    if (pagination) {
      this.createPaginationClause(pagination, clause);
    }

    return clause;
  }

  private createClause(filter: SearchQuery | SearchQuery[], logic: string) {
    if (filter.hasOwnProperty('by')) {
      return this.getWhereClause(<SearchQuery>filter);
    } else {
      return this.createMultipleClause(<SearchQuery[]>filter, logic);
    }
  }

  private createMultipleClause(filters: SearchQuery[], logic: string) {
    if ('or' === logic || 'OR' === logic) {
      return filters.map((filter) => {
        return this.getWhereClause(filter);
      });
    } else {
      const clauses: any = {};
      filters.forEach((filter) => {
        const { by, operator, value } = filter;
        clauses[by] = this.getOperator(operator, value);
      });

      return clauses;
    }
  }

  private getWhereClause(filter: SearchQuery) {
    const { by, operator, value } = filter;

    return this.unFlatten({
      [by]: this.getOperator(operator, value),
    });
  }

  private createOrderClause(orders: Order[]) {
    const orderClaus = new Map();

    orders.forEach((order) => {
      const { by, operator } = order;

      orderClaus.set(by, operator);
    });

    return Object.fromEntries(orderClaus);
  }

  private createPaginationClause(pagination: Pagination, clause: any) {
    clause['skip'] = (pagination.page - 1) * (pagination.pageSize + 1);
    clause['take'] = pagination.pageSize;
  }

  private getOperator(operator: string, value: any) {
    let ormOperator = null;

    switch (operator) {
      case 'eq':
        ormOperator = Equal(value);
        break;
      case 'ne':
        ormOperator = Not(Equal(value));
        break;
      case 'in':
        ormOperator = In(value);
        break;
      case 'notIn':
        ormOperator = Not(In(value));
        break;
      case 'lt':
        ormOperator = LessThan(value);
        break;
      case 'lte':
        ormOperator = LessThanOrEqual(value);
        break;
      case 'gt':
        ormOperator = MoreThan(value);
        break;
      case 'gte':
        ormOperator = MoreThanOrEqual(value);
        break;
      case 'between':
        ormOperator = Between(value[0], value[1]);
        break;
      case 'like':
        ormOperator = Like(value);
        break;
      case 'notLike':
        ormOperator = Not(Like(value));
        break;
      case 'iLike':
        ormOperator = ILike(value);
        break;
      case 'notILike':
        ormOperator = Not(ILike(value));
        break;
      default:
        ormOperator = Equal;
    }

    return ormOperator;
  }

  private unFlatten(data: any) {
    if (Object(data) !== data || Array.isArray(data)) {
      return data;
    }

    const regex = /\.?([^.\[\]]+)$|\[(\d+)\]$/;
    const props = Object.keys(data);

    let result, prop;

    while ((prop = props.shift())) {
      const m = regex.exec(prop)!;
      let target;
      if (m.index) {
        const rest = prop.slice(0, m.index);
        if (!(rest in data)) {
          data[rest] = m[2] ? [] : {};
          props.push(rest);
        }
        target = data[rest];
      } else {
        if (!result) {
          result = m[2] ? [] : {};
        }
        target = result;
      }
      target[m[2] || m[1]] = data[prop];
    }
    return result;
  }
}
