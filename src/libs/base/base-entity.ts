import {
  BaseEntity as BaseEntityClass,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ValueTransformer,
} from 'typeorm';
import { TypeormTransformers } from '../utils/transformers';

export class BaseEntity extends BaseEntityClass {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

export class BaseEntityWithoutId extends BaseEntityClass {
  @UpdateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
