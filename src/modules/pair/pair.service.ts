import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Pair } from "./pair.entity";
import { Repository } from "typeorm";
import { CreatePairDto, PairResponseDto, QueryPairDto, UpdatePairDto } from "./pair-dto";
import { InjectRedis } from "@nestjs-modules/ioredis";
import Redis from "ioredis";

@Injectable()
export class PairService {
    constructor(
        @InjectRepository(Pair)
        private readonly pairRepo: Repository<Pair>,
        @InjectRedis() private readonly redis: Redis
    ) {

    }

    private pairRedisKey(pair: string, chain: string) {
        return `Pair:${pair}:${chain}`;
    }

    private async cachePair(pair: PairResponseDto) {
        await this.redis.set(this.pairRedisKey(pair.pair, pair.chain), JSON.stringify(pair));
    }

    private async getCachedPair(pair: string, chain: string) {
        const cached = await this.redis.get(this.pairRedisKey(pair, chain));
        if (!cached) return null;
        return JSON.parse(cached) as PairResponseDto;
    }

    async importPair(
        params: CreatePairDto
    ): Promise<PairResponseDto> {
        console.log(params);
        const record = this.pairRepo.create({ ...params });
        const res = await this.pairRepo.save(record);
        await this.cachePair(res);
        return res;
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

        const res = await this.pairRepo.save(existing);
        await this.cachePair(res);
        return res;
    }

    async assertKnownPair(params: QueryPairDto): Promise<PairResponseDto> {
        const pair = await this.getPair(params);
        if (!pair) throw new NotFoundException('Pair not found!');

        return pair
    }

    async getPair(
        params: QueryPairDto
    ): Promise<PairResponseDto> {
        if (params.pair && params.chain) {
            const cached = await this.getCachedPair(params.pair, params.chain);
            if (cached) return cached;
        }
        const token = await this.pairRepo.findOneBy(params);
        return token;
    }

    async removePair(
        params: QueryPairDto
    ): Promise<boolean> {
        const pairsToDelete = await this.pairRepo.findBy(params); // Fetch all matching tokens first

        if (pairsToDelete.length === 0) {
            return false;
        }

        const deleted = await this.pairRepo.delete(params);

        if (deleted.affected > 0) {
            // Remove from Redis for each deleted token
            const pipeline = this.redis.pipeline();
            pairsToDelete.forEach((pair) => {
                pipeline.del(this.pairRedisKey(pair.pair, pair.chain));
            });
            await pipeline.exec();
            return true;
        }

        return false;
    }

    async poll(): Promise<PairResponseDto[]> {
        return await this.pairRepo.find({})
    }
}