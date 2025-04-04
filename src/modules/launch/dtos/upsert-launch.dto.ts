import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { ArrayMinSize, IsArray, IsInt, IsNotEmpty, IsString, Min } from "class-validator";
import {  typeWallet} from "src/modules/launch/launch.entity";

export class EncryptedDto {
    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    payload: string;
}

export class DistributeLaunchDto {
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


export class MixSwapDto {
    @ApiProperty({ type: [String] })
    @IsNotEmpty()
    middleAddress: string[];

    @ApiProperty({ type: [String] })
    @IsNotEmpty()
    endAddress: string[];
}

export class SwapDto {
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
}


export class SnipeDto {
    @ApiProperty({ type: [String] })
    @IsNotEmpty()
    endAddress: string[];

    @ApiProperty({ type: [String] })
    @IsNotEmpty()
    tokenValue: string[];
}