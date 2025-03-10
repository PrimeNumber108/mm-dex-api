import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Pair } from "./pair.entity";
import { Repository } from "typeorm";
import { CreatePairDto, PairResponseDto, QueryPairDto, UpdatePairDto } from "./pair-dto";

@Injectable()
export class PairService {
    constructor(
        @InjectRepository(Pair)
        private readonly pairRepo: Repository<Pair>
    ) {

    }
    async importPair(
        params: CreatePairDto
    ): Promise<PairResponseDto> {
        console.log(params);
        const record = this.pairRepo.create({ ...params });
        return await this.pairRepo.save(record)
    }

    async updatePair(
        params: UpdatePairDto
    ): Promise<PairResponseDto> {
        const { protocol, chain, ...update } = params
        let existing = await this.assertKnownPair({
            protocol,
            chain
        });
        existing = {
            ...existing,
            ...update
        }

        return this.pairRepo.save(existing);
    }

    async assertKnownPair(params: QueryPairDto): Promise<PairResponseDto> {
        const pair = await this.getPair(params);
        if (!pair) throw new NotFoundException('Pair not found!');

        return pair
    }

    async getPair(
        params: QueryPairDto
    ): Promise<PairResponseDto> {
        const token = await this.pairRepo.findOneBy(params);
        return token;
    }

    async removePair(
        params: QueryPairDto
    ): Promise<boolean> {
        return (await this.pairRepo.delete(params)).affected > 0;
    }

    async poll(): Promise<PairResponseDto[]> {
        return await this.pairRepo.find({})
    }
}