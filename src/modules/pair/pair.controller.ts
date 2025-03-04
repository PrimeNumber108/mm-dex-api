import { Body, Controller, Delete, Get, Post, Put, Query } from "@nestjs/common";
import { ApiResponse, ApiSecurity, ApiTags } from "@nestjs/swagger";
import { PairService } from "./pair.service";
import { CreatePairDto, PairResponseDto, QueryPairDto, UpdatePairDto } from "./pair-dto";

@ApiTags('Pair')
@ApiSecurity('x-api-secret') // Ensure Swagger includes x-api-secret
@ApiSecurity('username') // Ensure Swagger includes username
@Controller('pair')
export class PairController {
    constructor(
        private readonly pairService: PairService
    ) { }

    @Post('/import')
    @ApiResponse({
        status: 201,
        type: PairResponseDto,
        description: 'Pair'
    })
    async importPair(@Body() params: CreatePairDto): Promise<PairResponseDto> {
        return await this.pairService.importPair(params)
    }

    @Put('/update')
    @ApiResponse({
        status: 201,
        type: PairResponseDto,
        description: 'Updated Pair'
    })
    async updatePair(@Body() params: UpdatePairDto): Promise<PairResponseDto> {
        return await this.pairService.updatePair(params)
    }

    @Delete('/remove')
    @ApiResponse({
        status: 201,
        type: Boolean,
        description: 'Removed successfully'
    })
    async removePair(@Body() params: QueryPairDto): Promise<boolean> {
        return await this.pairService.removePair(params)
    }

    @Get('/')
    @ApiResponse({
        status: 200,
        type: PairResponseDto,
        description: 'Pair'
    })
    async getPair(@Query() params: QueryPairDto): Promise<PairResponseDto> {
        return await this.pairService.getPair(params);
    }
}