import { ApiProperty, ApiPropertyOptional, ApiResponseProperty, OmitType } from "@nestjs/swagger";
import { BaseOrderResponseDto, CreateBaseOrderDto, QueryBaseOrderDto } from "./base-order.dto";
import { IsNumberString } from "class-validator";

export class QueryWithdrawalOrderDto extends QueryBaseOrderDto {
    @ApiPropertyOptional({ type: String })
    token?: string;

    @ApiPropertyOptional({ type: String })
    recipient?: string;
}

export class CreateWithdrawalOrderDto extends CreateBaseOrderDto {
    @ApiProperty({ type: String })
    token: string;

    @ApiProperty({ type: String })
    recipient: string;

    @ApiProperty({ type: String })
    @IsNumberString()
    amount: string;
}

export class WithdrawalOrderResponseDto extends BaseOrderResponseDto {
    @ApiResponseProperty({ type: String })
    token: string;

    @ApiResponseProperty({ type: String })
    recipient: string;

    @ApiResponseProperty({ type: String })
    amount: string;
}