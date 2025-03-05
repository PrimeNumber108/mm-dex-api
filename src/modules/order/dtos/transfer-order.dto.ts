import { ApiProperty, ApiPropertyOptional, ApiResponseProperty, OmitType } from "@nestjs/swagger";
import { BaseOrderResponseDto, CreateBaseOrderDto, QueryBaseOrderDto } from "./base-order.dto";
import { IsNumberString } from "class-validator";
import { Type } from "class-transformer";
import { QueryWalletsDto } from "src/modules/wallet/dtos/query-wallet.dto";

export class QueryTransferOrderDto extends QueryBaseOrderDto {
    @ApiPropertyOptional({ type: String })
    token?: string;

    @ApiPropertyOptional({ type: String })
    recipient?: string;
}

export class CreateTransferOrderDto extends CreateBaseOrderDto {
    @ApiProperty({ type: String })
    token: string;

    @ApiProperty({ type: String })
    recipient: string;

    @ApiProperty({ type: String })
    @IsNumberString()
    amount: string;
}

export class TransferOrderResponseDto extends BaseOrderResponseDto {
    @ApiResponseProperty({ type: String })
    token: string;

    @ApiResponseProperty({ type: String })
    recipient: string;

    @ApiResponseProperty({ type: String })
    amount: string;
}

export class CreateBatchedTransferDto extends CreateBaseOrderDto {
    @ApiProperty({ type: String })
    token: string;

    @ApiProperty({ type: QueryWalletsDto })
    @Type(() => QueryWalletsDto)
    recipients: QueryWalletsDto;

    @ApiProperty({ type: [String] })
    amounts: string[];
}

export class CreateBatchedTransferMultiSendersDto extends OmitType(CreateBaseOrderDto, ['account']) {
    @ApiProperty({ type: QueryWalletsDto })
    @Type(() => QueryWalletsDto)
    senders: QueryWalletsDto;

    @ApiProperty({ type: String })
    token: string;

    @ApiProperty({ type: String })
    recipient: string;

    @ApiProperty({ type: [String] })
    amounts: string[];
}