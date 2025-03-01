import { BaseEntity } from 'src/utils/base/base-entity';
import { Column, Index } from 'typeorm';

@Index(['username'])
@Index(['account', 'chain'])
export abstract class BaseOrder extends BaseEntity {
  @Column({ nullable: false })
  username: string;

  @Column({ nullable: false })
  chain: string;

  @Column({ nullable: false })
  account: string;

  @Column({ nullable: false })
  txHash: string;
}