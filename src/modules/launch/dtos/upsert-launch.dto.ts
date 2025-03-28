import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { ArrayMinSize, IsArray, IsInt, IsNotEmpty, IsString, Min } from "class-validator";
import {  typeWallet} from "src/modules/launch/launch.entity";

export class EncryptedDto {
    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    payload: string;
}

export class ImportLaunchDto {
    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    privateKey: string;

    @ApiProperty({ type: String }) // Made required
    @IsNotEmpty()
    @IsString()
    chain: string;

    @ApiPropertyOptional({ type: String })
    cluster?: string;

    @ApiProperty({ type: String }) // Made required
    @IsNotEmpty()
    @IsString()
    symbol: string;

    @ApiProperty({ type: String }) // Made required
    @IsNotEmpty()
    @IsString()
    type: typeWallet;
}
