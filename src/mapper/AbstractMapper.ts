export default abstract class AbstractMapper<T, D> {
    abstract toDTO(entity: T): D;

    abstract toEntity(dto: D): T;
}
