import { ApiProperty, ApiPropertyOptional, ApiResponseProperty } from "@nestjs/swagger";
import { BaseResponse } from "src/utils/base/base-response";

export class CreateBaseOrderDto {
    @ApiProperty({ type: String })
    username: string;

    @ApiProperty({ type: String })
    chain: string;

    @ApiProperty({ type: String })
    account: string;
}

export class BaseFinalizedOrderDto extends CreateBaseOrderDto {
    txHash: string
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
}

export class BaseOrderResponseDto extends BaseResponse {
    @ApiResponseProperty({ type: String })
    username: string;

    @ApiResponseProperty({ type: String })
    chain: string;

    @ApiResponseProperty({ type: String })
    account: string;

    @ApiResponseProperty({ type: String })
    txHash: string;
}