import { BaseEntity } from 'src/libs/base/base-entity';
import { BeforeInsert, BeforeUpdate, Column, Entity, Index } from 'typeorm';

@Entity()
@Index(['chain', 'protocol'], { unique: true })
export class Pair extends BaseEntity {
    @Column({ nullable: false })
    pair: string;

    @Column({ nullable: false })
    chain: string;

    @Column({ nullable: false })
    token0: string;

    @Column({ nullable: false })
    token1: string;

    @Column({ nullable: false })
    fee: string;

    @Column({ nullable: false })
    protocol: string;

    @BeforeInsert()
    @BeforeUpdate()
    protected arrangeTokens(){
        const isToken0Smaller = BigInt(this.token0) < BigInt(this.token1)
        const token0 = isToken0Smaller ? this.token0 : this.token1;
        const token1 = isToken0Smaller ? this.token1 : this.token0;
        this.token0 = token0;
        this.token1 = token1;
    }
}