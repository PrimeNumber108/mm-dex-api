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

    @ApiPropertyOptional({ type: String })
    @IsNumberString()
    amountMin?: string;

    @ApiPropertyOptional({ type: String })
    @IsNumberString()
    amountMax?: string;
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

export class TransferOrderRequestDto extends OmitType(CreateTransferOrderDto,
    ['chain', 'username', 'txHash']
) { }

export class CreateBatchedTransferDto extends CreateBaseOrderDto {
    @ApiProperty({ type: String })
    token: string;

    @ApiProperty({ type: QueryWalletsDto })
    @Type(() => QueryWalletsDto)
    recipients: QueryWalletsDto;

    @ApiProperty({ type: [String] })
    amounts: string[];
}

export class BatchedTransferRequestDto extends OmitType(CreateBatchedTransferDto, [
    'chain',
    'username',
    'txHash'
]) { }

export class CreateBatchedTransferMultiSendersDto extends CreateBaseOrderDto {
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

export class BatchedTransferMultiSendersRequestDto extends OmitType(CreateBatchedTransferMultiSendersDto, [
    'chain',
    'username',
    'txHash'
]) { }