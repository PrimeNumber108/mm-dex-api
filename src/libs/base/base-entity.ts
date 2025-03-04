import {
  BaseEntity as BaseEntityClass,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ValueTransformer,
} from 'typeorm';

// Transformer to convert between Date and Unix timestamp (seconds)
const timestampTransformer: ValueTransformer = {
  to: (value: Date) => Math.floor(value.getTime() / 1000), // Convert Date to seconds
  from: (value: number) => new Date(value * 1000), // Convert seconds to Date
};

export class BaseEntity extends BaseEntityClass {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @CreateDateColumn({ type: 'int', transformer: timestampTransformer })
  created_at: number;

  @UpdateDateColumn({ type: 'int', transformer: timestampTransformer })
  updated_at: number;
}

export class BaseEntityWithoutId extends BaseEntityClass {
  @CreateDateColumn({ type: 'int', transformer: timestampTransformer })
  created_at: number;

  @UpdateDateColumn({ type: 'int', transformer: timestampTransformer })
  updated_at: number;
}
