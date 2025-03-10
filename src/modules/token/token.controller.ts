import { Body, Controller, Delete, Get, Post, Put, Query } from "@nestjs/common";
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
    async importToken(@Body() params: CreateTokenDto): Promise<TokenResponseDto> {
        return await this.tokenService.importToken(params)
    }

    @Put('/update')
    @ApiResponse({
        status: 201,
        type: TokenResponseDto,
        description: 'Updated Token'
    })
    async updateToken(@Body() params: UpdateTokenDto): Promise<TokenResponseDto> {
        return await this.tokenService.updateToken(params)
    }

    @Delete('/remove')
    @ApiResponse({
        status: 201,
        type: Boolean,
        description: 'Removed successfully'
    })
    async removeToken(@Body() params: QueryTokenDto): Promise<boolean> {
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

    @Get('/poll')
    @ApiResponse({
        status: 200,
        type: [TokenResponseDto],
        description: 'All Tokens'
    })
    async poll(): Promise<TokenResponseDto[]> {
        return await this.tokenService.poll();
    }
}