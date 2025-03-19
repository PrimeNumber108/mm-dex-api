import { BaseEntity } from 'src/libs/base/base-entity';
import { TypeormTransformers } from 'src/libs/utils/transformers';
import { AfterLoad, BeforeInsert, BeforeUpdate, Column, Entity, Index } from 'typeorm';

@Entity()
@Index(['address'], { unique: true })
@Index(['cluster'])
export class Wallet extends BaseEntity {

  @Column({ nullable: false, type: 'integer' })
  index: number;

  @Column({ nullable: false })
  address: string;

  @Column({
    nullable: false, transformer: TypeormTransformers.encryptionTransformer
  })
  privateKey: string;

  @Column({ nullable: false, default: 'no' })
  cluster: string;
  @Column({
    type: 'text',  // Store as TEXT in the database
    nullable: true,
    transformer: TypeormTransformers.stringArrayTransformer,  // Use our transformer
  })
  chains: string[];
}