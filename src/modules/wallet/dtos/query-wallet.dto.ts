import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class QueryWalletDto {
    @ApiPropertyOptional({type: String})
    address?: string;

    @ApiPropertyOptional({type: Number})
    index?: number;

    @ApiPropertyOptional({type: String})
    cluster?: string;
}

export class QueryClusterDto {
    @ApiProperty({ type: String }) // Made required
    @IsNotEmpty()
    @IsString()
    cluster: string;

    @ApiProperty({ type: Number, required: false})
    @Type(() => Number)
    @IsOptional()
    fromIndex?: number;

    @ApiProperty({ type: Number, required: false})
    @Type(() => Number)
    @IsOptional()
    toIndex?: number;
}

export class QueryWalletsDto {
    @ApiProperty({ type: String }) // Made required
    @IsOptional()
    cluster?: string;

    @ApiProperty({ type: Number, required: false})
    @Type(() => Number)
    @IsOptional()
    fromIndex?: number;

    @ApiProperty({ type: Number, required: false})
    @Type(() => Number)
    @IsOptional()
    toIndex?: number;

    @ApiProperty({type: [String]})
    @IsOptional()
    accounts?: string[];
}

