import { PrimaryGeneratedColumn } from "typeorm";

export default abstract class AbstractEntity {
  @PrimaryGeneratedColumn({ name: "id" })
  protected id: number;
}
