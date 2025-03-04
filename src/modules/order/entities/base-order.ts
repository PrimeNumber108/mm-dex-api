import { BaseEntity } from 'src/libs/base/base-entity';
import { getTimestampInSeconds } from 'src/libs/utils/timeHelper';
import { BeforeInsert, Column, ColumnOptions, Index } from 'typeorm';

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

  @Column({ nullable: false, type: 'integer' })
  executionTime: number;

  @BeforeInsert()
  protected setExecutionTime() {
    this.executionTime = getTimestampInSeconds();
  }
}

export const floatOptions: ColumnOptions = {
  type: 'numeric',
  precision: 27,
  scale: 18,
  nullable: false
}