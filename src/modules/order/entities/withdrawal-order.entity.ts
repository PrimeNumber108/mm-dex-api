import { Column, Entity } from 'typeorm';
import { BaseOrder } from './base-order.entity';

@Entity()
export class WithdrawalOrder extends BaseOrder {
  @Column({ nullable: false })
  token: string;

  @Column({ nullable: false })
  recipient: string;

  @Column({ type: 'bigint', nullable: false })
  amount: string;
}