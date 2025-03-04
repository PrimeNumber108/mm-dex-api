import { BaseEntity } from 'src/libs/base/base-entity';
import { Column, Entity, Index } from 'typeorm';

@Entity()
@Index(['address', 'chain'], { unique: true })
export class Token extends BaseEntity {
    @Column({ nullable: false })
    address: string;

    @Column({ nullable: false })
    chain: string;

    @Column({ nullable: false })
    name: string;

    @Column({ nullable: false })
    symbol: string;

    @Column({ nullable: false })
    decimals: number;
}