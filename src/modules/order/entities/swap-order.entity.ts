import { Column, Entity } from 'typeorm';
import { BaseOrder, floatOptions } from './base-order.entity';

@Entity()
export class SwapOrder extends BaseOrder {
  @Column({ nullable: false })
  tokenIn: string;

  @Column({ nullable: false })
  tokenOut: string;

  @Column({ nullable: false })
  recipient: string;

  @Column({ nullable: false })
  protocol: string;

  @Column(floatOptions)
  amountIn: string;

  @Column(floatOptions)
  amountOutMin: string;
}