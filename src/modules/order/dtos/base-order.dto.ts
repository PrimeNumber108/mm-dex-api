import { ApiProperty, ApiPropertyOptional, ApiResponseProperty } from "@nestjs/swagger";
import { BaseResponse } from "src/libs/base/base-response";

export class CreateBaseOrderDto {
    username: string;

    @ApiProperty({ type: String })
    chain: string;

    @ApiProperty({ type: String })
    account: string;

    txHash: string;
}

export class QueryBaseOrderDto {
    @ApiPropertyOptional({ type: String })
    username?: string;

    @ApiPropertyOptional({ type: String })
    chain?: string;

    @ApiPropertyOptional({ type: String })
    account?: string;

    @ApiPropertyOptional({ type: String })
    txHash?: string;

    @ApiPropertyOptional({ type: Number })
    fromTs?: number;

    @ApiPropertyOptional({ type: Number })
    toTs?: number;
}

export class BaseOrderResponseDto extends BaseResponse {
    @ApiResponseProperty({ type: String })
    username: string;

    @ApiResponseProperty({ type: String })
    chain: string;

    @ApiResponseProperty({ type: String })
    account: string;

    @ApiResponseProperty({ type: Number })
    executionTime: number;

    @ApiResponseProperty({ type: String })
    txHash: string;
}

export class BaseOrderWithTagResponseDto extends BaseOrderResponseDto {
    @ApiResponseProperty({ type: String })
    tag: string;
}

export class PollOrderDto extends QueryBaseOrderDto {
    @ApiPropertyOptional({ type: String })
    tag?: string;
}