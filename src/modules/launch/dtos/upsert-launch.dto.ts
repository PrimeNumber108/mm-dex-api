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
    originalAddress: string;

    @ApiProperty({ type: String }) // Made required
    @IsNotEmpty()
    @IsString()
    token: string;

    @ApiProperty({ type: [String] })
    @IsNotEmpty()
    middleAddress: string[];

    
    @ApiProperty({ type: [String] })
    @IsNotEmpty()
    endAddress: string[];

    @ApiProperty({ type: [String] })
    @IsNotEmpty()
    tokenValue: string[];
}
