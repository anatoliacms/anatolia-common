import { NotFoundException } from "@nestjs/common";

export default abstract class AbstractService<T> {
  isEntityExists(entity: T) {
    if (!entity) {
      throw new NotFoundException(`Not Found`, {
        cause: new Error(),
        description: `Entity not found with given id.`
      });
    }
  }
}
