import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Token } from "./token.entity";
import { Repository } from "typeorm";
import { CreateTokenDto, QueryTokenDto, TokenResponseDto } from "./token-dto";

@Injectable()
export class TokenService {
    constructor(
        @InjectRepository(Token)
        private readonly tokenRepo: Repository<Token>
    ){
        
    }

    async importToken(
        params: CreateTokenDto
    ): Promise<TokenResponseDto> {
        const record = this.tokenRepo.create(params);
        return await this.tokenRepo.save(record)
    }

    async assertKnownToken(params: QueryTokenDto): Promise<TokenResponseDto>{
        const token = await this.getToken(params);
        if (!token) throw new BadRequestException('Token not found!');
        return token
    }
    
    async getToken(
        params: QueryTokenDto
    ): Promise<TokenResponseDto> {
        const token = await this.tokenRepo.findOneBy(params);
        return token;
    }
}