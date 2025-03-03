import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Token } from "./token.entity";
import { Repository } from "typeorm";
import { CreateTokenDto, PairDataDto, QueryTokenDto, TokenResponseDto } from "./token-dto";

@Injectable()
export class TokenService {
    constructor(
        @InjectRepository(Token)
        private readonly tokenRepo: Repository<Token>
    ) {

    }
    static encodePairData(pairData: PairDataDto[]) {
        const json = {};
        for (const item of pairData) {
            const { protocol, ...rest } = item;
            json[protocol] = { ...rest };
        }
        return JSON.stringify(json);
    }

    static decodePairData(encoded: string) {
        const json = JSON.parse(encoded);
        const pairData: PairDataDto[] = [];
        for (const [protocol, data] of Object.entries(json)) {
            pairData.push({
                protocol,
                ...(data as any)
            })
        }
        return pairData
    }

    async importToken(
        params: CreateTokenDto
    ): Promise<TokenResponseDto> {
        const record = this.tokenRepo.create({ ...params });
        return await this.tokenRepo.save(record)
    }

    async assertKnownToken(params: QueryTokenDto): Promise<TokenResponseDto> {
        const token = await this.getToken(params);
        if (!token) throw new NotFoundException('Token not found!');

        return token
    }

    async getToken(
        params: QueryTokenDto
    ): Promise<TokenResponseDto> {
        const token = await this.tokenRepo.findOneBy(params);
        return token;
    }
}