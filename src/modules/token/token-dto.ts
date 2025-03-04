import { ApiProperty, ApiPropertyOptional, ApiResponseProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsOptional } from "class-validator";
import { BaseResponse } from "src/libs/base/base-response";

export class PairDataDto {
    @ApiResponseProperty({type: String })
    pair: string;

    @ApiResponseProperty({type: String })
    otherToken: string;

    @ApiResponseProperty({type: String })
    @IsOptional()
    fee?: string;

    @ApiResponseProperty({type: String })
    protocol: string;
}

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

    @ApiResponseProperty({ type: [PairDataDto] })
    pairData: PairDataDto[];
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
}

export class CreatePairDataDto {
    @ApiProperty({type: String })
    pair: string;

    @ApiProperty({type: String })
    otherToken: string;

    @ApiPropertyOptional({type: String })
    @IsOptional()
    fee?: string;

    @ApiProperty({type: String })
    protocol: string;
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

    @ApiProperty({ type: [CreatePairDataDto] })
    @Type(() => CreatePairDataDto)
    pairData: CreatePairDataDto[];
}

export class UpdateTokenDto {
    @ApiProperty({ type: String })
    address: string;

    @ApiProperty({ type: String })
    chain: string;

    @ApiPropertyOptional({ type: String })
    name?: string;

    @ApiPropertyOptional({ type: String })
    symbol?: string;

    @ApiPropertyOptional({ type: Number })
    decimals?: number;

    @ApiPropertyOptional({ type: [CreatePairDataDto] })
    @Type(() => CreatePairDataDto)
    pairData?: CreatePairDataDto[];
}