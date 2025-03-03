import { Column, Entity } from 'typeorm';
import { BaseOrder, floatOptions } from './base-order.entity';

@Entity()
export class WithdrawalOrder extends BaseOrder {
  @Column({ nullable: false })
  token: string;

  @Column({ nullable: false })
  recipient: string;

  @Column(floatOptions)
  amount: string;
}