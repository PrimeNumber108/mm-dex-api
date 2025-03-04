import { BaseEntity } from 'src/libs/base/base-entity';
import { Column, Entity } from 'typeorm';
import { PairDataDto } from './token-dto';
import { TokenService } from './token.service';

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

    @Column({
        nullable: true, transformer: {
            to(value: PairDataDto[]) {
                return TokenService.encodePairData(value)
            },
            from(value: string) {
                return TokenService.decodePairData(value)
            }
        }
    })
    pairData: PairDataDto[];
}