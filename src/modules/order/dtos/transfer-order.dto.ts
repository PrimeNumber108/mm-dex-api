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
    ['chain', 'username']
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
    'username'
]) { }

export class CreateDistributionDto extends CreateBaseOrderDto {
    @ApiProperty({ type: QueryWalletsDto })
    @Type(() => QueryWalletsDto)
    middleWallets: QueryWalletsDto;

    @ApiProperty({ type: QueryWalletsDto })
    @Type(() => QueryWalletsDto)
    endWallets: QueryWalletsDto;

    @ApiProperty({ type: String })
    token: string;

    @ApiProperty({ type: [String] })
    endAmounts: string[];
}

export class DistributionRequestDto extends OmitType(CreateDistributionDto, [
    'chain',
    'username'
]) { }

export class CreateGatheringDto extends CreateBaseOrderDto {
    @ApiProperty({ type: QueryWalletsDto })
    @Type(() => QueryWalletsDto)
    middleWallets: QueryWalletsDto;

    @ApiProperty({ type: QueryWalletsDto })
    @Type(() => QueryWalletsDto)
    endWallets: QueryWalletsDto;

    @ApiProperty({ type: String })
    token: string;

    @ApiProperty({ type: [String] })
    endAmounts: string[];
}

export class GatheringRequestDto extends OmitType(CreateGatheringDto, [
    'chain',
    'username'
]) { }