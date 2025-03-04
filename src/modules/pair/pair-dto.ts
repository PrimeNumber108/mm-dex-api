import { ApiProperty, ApiPropertyOptional, ApiResponseProperty, PartialType } from "@nestjs/swagger";
import { BaseResponse } from "src/libs/base/base-response";

export class PairResponseDto extends BaseResponse {
    @ApiResponseProperty({ type: String })
    pair: string;

    @ApiResponseProperty({ type: String })
    chain: string;

    @ApiResponseProperty({ type: String })
    token0: string;

    @ApiResponseProperty({ type: String })
    token1: string;

    @ApiResponseProperty({ type: String })
    protocol: string;

    @ApiResponseProperty({ type: String })
    fee: string;
}

export class CreatePairDto {
    @ApiProperty({ type: String })
    pair: string;

    @ApiProperty({ type: String })
    chain: string;

    @ApiProperty({ type: String })
    token0: string;

    @ApiProperty({ type: String })
    token1: string;

    @ApiProperty({ type: String })
    protocol: string;

    @ApiProperty({ type: String })
    fee: string;
}

export class UpdatePairDto {
    @ApiPropertyOptional({ type: String })
    pair?: string;

    @ApiProperty({ type: String })
    chain: string;

    @ApiPropertyOptional({ type: String })
    token0?: string;

    @ApiPropertyOptional({ type: String })
    token1?: string;

    @ApiProperty({ type: String })
    protocol: string;

    @ApiPropertyOptional({ type: String })
    fee?: string;
}
export class QueryPairDto extends PartialType(CreatePairDto) { }
