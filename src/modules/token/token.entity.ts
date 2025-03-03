import { BaseEntity } from 'src/utils/base/base-entity';
import { Column, Entity } from 'typeorm';

@Entity()
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

    @Column({ nullable: true })
    pair?: string;

    @Column({ nullable: true })
    protocol?: string;
}