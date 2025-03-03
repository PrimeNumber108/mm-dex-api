import { ApiProperty, ApiPropertyOptional, ApiResponseProperty, OmitType } from "@nestjs/swagger";
import { BaseOrderResponseDto, CreateBaseOrderDto, QueryBaseOrderDto } from "./base-order.dto";
import { IsNumberString } from "class-validator";
import { Type } from "class-transformer";

export class QuerySwapOrderDto extends QueryBaseOrderDto {
    @ApiPropertyOptional({ type: String })
    tokenIn?: string;

    @ApiPropertyOptional({ type: String })
    tokenOut?: string;

    @ApiPropertyOptional({ type: String })
    recipient?: string;

    @ApiPropertyOptional({ type: String })
    protocol?: string;

    @ApiPropertyOptional({ type: String })
    @IsNumberString()
    amountInMin?: string;

    @ApiPropertyOptional({ type: String })
    @IsNumberString()
    amountInMax?: string;
}

export class CreateSwapOrderDto extends CreateBaseOrderDto {
    @ApiProperty({ type: String })
    tokenIn: string;

    @ApiProperty({ type: String })
    tokenOut: string;

    @ApiProperty({ type: String })
    recipient: string;

    @ApiProperty({ type: String })
    protocol: string;

    @ApiProperty({ type: String })
    @IsNumberString()
    amountIn: string;

    @ApiProperty({ type: String })
    @IsNumberString()
    amountOutMin: string;
}

export class SwapOrderRequestDto extends OmitType(CreateBaseOrderDto, [
    'chain',
    'username',
    'txHash'
]) {}

export class BatchedSwapOrderRequestDto {
    @ApiProperty({ type: [SwapOrderRequestDto]})
    @Type(() => SwapOrderRequestDto)
    orders: SwapOrderRequestDto[];
}

export class SwapOrderResponseDto extends BaseOrderResponseDto {
    @ApiResponseProperty({ type: String })
    tokenIn: string;

    @ApiResponseProperty({ type: String })
    tokenOut: string;

    @ApiResponseProperty({ type: String })
    recipient: string;

    @ApiResponseProperty({ type: String })
    protocol: string;

    @ApiResponseProperty({ type: String })
    amountIn: string;

    @ApiResponseProperty({ type: String })
    amountOutMin: string;
}

export class BatchedSwapOrderResponseDto {
    @ApiResponseProperty({ type: [SwapOrderResponseDto]})
    orders: SwapOrderResponseDto
}