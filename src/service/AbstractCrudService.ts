import AbstractEntity from "../model/AbstractEntity";
import AbstractDTO from "../payload/AbstractDTO";
import { Repository } from "typeorm";
import AbstractMapper from "../mapper/AbstractMapper";
import { NotFoundException } from "@nestjs/common";
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

  async findAll(): Promise<T[]> {
    return await this.getRepository().find();
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
}
