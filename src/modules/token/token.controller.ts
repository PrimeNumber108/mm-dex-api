import { Controller, Delete, Get, Post, Put, Query } from "@nestjs/common";
import { ApiResponse, ApiSecurity, ApiTags } from "@nestjs/swagger";
import { TokenService } from "./token.service";
import { CreateTokenDto, QueryTokenDto, TokenResponseDto, UpdateTokenDto } from "./token-dto";

@ApiTags('Token')
@ApiSecurity('x-api-secret') // Ensure Swagger includes x-api-secret
@ApiSecurity('username') // Ensure Swagger includes username
@Controller('token')
export class TokenController {
    constructor(
        private readonly tokenService: TokenService
    ) { }

    @Post('/import')
    @ApiResponse({
        status: 201,
        type: TokenResponseDto,
        description: 'Token'
    })
    async importToken(params: CreateTokenDto): Promise<TokenResponseDto> {
        return await this.tokenService.importToken(params)
    }

    @Put('/update')
    @ApiResponse({
        status: 201,
        type: TokenResponseDto,
        description: 'Updated Token'
    })
    async updateToken(params: UpdateTokenDto): Promise<TokenResponseDto> {
        return await this.tokenService.updateToken(params)
    }

    @Delete('/remove')
    @ApiResponse({
        status: 201,
        type: Boolean,
        description: 'Removed successfully'
    })
    async removeToken(params: QueryTokenDto): Promise<boolean> {
        return await this.tokenService.removeToken(params)
    }

    @Get('/')
    @ApiResponse({
        status: 200,
        type: TokenResponseDto,
        description: 'Token'
    })
    async getToken(@Query() params: QueryTokenDto): Promise<TokenResponseDto> {
        return await this.tokenService.getToken(params);
    }
}