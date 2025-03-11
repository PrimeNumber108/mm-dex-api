import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Token } from "./token.entity";
import { Repository } from "typeorm";
import { CreateTokenDto, QueryTokenDto, TokenResponseDto, UpdateTokenDto } from "./token-dto";
import { InjectRedis } from "@nestjs-modules/ioredis";
import Redis from "ioredis";

@Injectable()
export class TokenService {
    constructor(
        @InjectRepository(Token)
        private readonly tokenRepo: Repository<Token>,
        @InjectRedis() private readonly redis: Redis
    ) {

    }

    private tokenRedisKey(token: string, chain: string) {
        return `Token:${token}:${chain}`;
    }

    private async cacheToken(token: TokenResponseDto) {
        await this.redis.set(this.tokenRedisKey(token.address, token.chain), JSON.stringify(token));
    }

    private async getCachedToken(token: string, chain: string) {
        const cached = await this.redis.get(this.tokenRedisKey(token, chain));
        if (!cached) return null;
        return JSON.parse(cached) as TokenResponseDto;
    }

    async importToken(
        params: CreateTokenDto
    ): Promise<TokenResponseDto> {
        const record = this.tokenRepo.create({ ...params });
        const res = await this.tokenRepo.save(record)

        await this.cacheToken(res);
        return res;
    }

    async updateToken(
        params: UpdateTokenDto
    ): Promise<TokenResponseDto> {
        const { address, chain, ...update } = params
        let existing = await this.assertKnownToken({
            address,
            chain
        });
        existing = {
            ...existing,
            ...update
        }

        const res = await this.tokenRepo.save(existing);
        await this.cacheToken(res);
        return res;
    }

    async assertKnownToken(params: QueryTokenDto): Promise<TokenResponseDto> {
        const token = await this.getToken(params);
        if (!token) throw new NotFoundException('Token not found!');

        return token
    }

    async getToken(
        params: QueryTokenDto
    ): Promise<TokenResponseDto> {
        if (params.address && params.chain) {
            const cached = await this.getCachedToken(params.address, params.chain);
            if (cached) return cached;
        }

        const token = await this.tokenRepo.findOneBy(params);
        return token;
    }

    async removeToken(params: QueryTokenDto): Promise<boolean> {
        const tokensToDelete = await this.tokenRepo.findBy(params); // Fetch all matching tokens first
    
        if (tokensToDelete.length === 0) {
            return false;
        }
    
        const deleted = await this.tokenRepo.delete(params);
    
        if (deleted.affected > 0) {
            // Remove from Redis for each deleted token
            const pipeline = this.redis.pipeline();
            tokensToDelete.forEach((token) => {
                pipeline.del(this.tokenRedisKey(token.address, token.chain));
            });
            await pipeline.exec();
            return true;
        }
    
        return false;
    }    

    async poll(): Promise<TokenResponseDto[]> {
        return await this.tokenRepo.find({});
    }
}