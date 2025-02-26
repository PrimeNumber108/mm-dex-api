import { BaseEntity } from 'src/utils/base/base-entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class Logs extends BaseEntity {
  @Column()
  status: 'error' | 'info';

  @Column({ type: 'varchar', length: 1024 })
  message: string;

  @Column({ type: 'text', nullable: true, default: null })
  meta: string;
}
