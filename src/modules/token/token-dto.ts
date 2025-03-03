import { ApiProperty, ApiPropertyOptional, ApiResponseProperty } from "@nestjs/swagger";
import { IsOptional } from "class-validator";
import { BaseResponse } from "src/utils/base/base-response";

export class TokenResponseDto extends BaseResponse {
    @ApiResponseProperty({ type: String })
    address: string;

    @ApiResponseProperty({ type: String })
    chain: string;

    @ApiResponseProperty({ type: String })
    name: string;

    @ApiResponseProperty({ type: String })
    symbol: string;

    @ApiResponseProperty({ type: Number })
    decimals: number;

    @ApiResponseProperty({ type: String })
    @IsOptional()
    pair?: string;

    @ApiResponseProperty({ type: String })
    @IsOptional()
    protocol?: string;
}

export class QueryTokenDto {
    @ApiPropertyOptional({ type: String })
    address?: string;

    @ApiPropertyOptional({ type: String })
    chain?: string;

    @ApiPropertyOptional({ type: String })
    name?: string;

    @ApiPropertyOptional({ type: String })
    symbol?: string;

    @ApiResponseProperty({ type: String })
    @IsOptional()
    pair?: string;

    @ApiResponseProperty({ type: String })
    @IsOptional()
    protocol?: string;
}

export class CreateTokenDto {
    @ApiProperty({ type: String })
    address: string;

    @ApiProperty({ type: String })
    chain: string;

    @ApiProperty({ type: String })
    name: string;

    @ApiProperty({ type: String })
    symbol: string;

    @ApiProperty({ type: Number })
    decimals: number;

    @ApiResponseProperty({ type: String })
    @IsOptional()
    pair?: string;

    @ApiResponseProperty({ type: String })
    @IsOptional()
    protocol?: string;
}