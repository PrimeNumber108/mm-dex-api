import { BaseEntity } from 'src/utils/base/base-entity';
import { Column, Entity, Index } from 'typeorm';

@Entity()
@Index(['chain', 'address', 'cluster'], { unique: true })
export class Wallet extends BaseEntity {

  @Column({nullable: false, type: 'number'})
  index: number;
  
  @Column({ nullable: false })
  address: string;

  @Column({ nullable: false })
  privateKey: string;

  @Column({ nullable: false })
  chain: string;

  @Column({ nullable: false, default: 'no' })
  cluster: string;
}