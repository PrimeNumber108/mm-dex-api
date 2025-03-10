import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Token } from "./token.entity";
import { Repository } from "typeorm";
import { CreateTokenDto, QueryTokenDto, TokenResponseDto, UpdateTokenDto } from "./token-dto";

@Injectable()
export class TokenService {
    constructor(
        @InjectRepository(Token)
        private readonly tokenRepo: Repository<Token>
    ) {

    }

    async importToken(
        params: CreateTokenDto
    ): Promise<TokenResponseDto> {
        const record = this.tokenRepo.create({ ...params });
        return await this.tokenRepo.save(record)
    }

    async updateToken(
        params: UpdateTokenDto
    ): Promise<TokenResponseDto> {
        const {address, chain, ...update} = params
        let existing = await this.assertKnownToken({
            address,
            chain
        });
        existing = {
            ...existing,
            ...update
        }

        return this.tokenRepo.save(existing);
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

    async removeToken(
        params: QueryTokenDto
    ): Promise<boolean>{
        return (await this.tokenRepo.delete(params)).affected > 0;
    }

    async poll(): Promise<TokenResponseDto[]> {
        return await this.tokenRepo.find({});
    }
}