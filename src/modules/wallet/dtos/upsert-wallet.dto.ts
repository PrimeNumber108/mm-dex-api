import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { ArrayMinSize, IsArray, IsInt, IsNotEmpty, IsString, Min } from "class-validator";

export class EncryptedDto {
    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    payload: string;
}

export class ImportWalletDto {
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
}

export class GenerateWalletDto {
    @ApiProperty({ type: String }) // Made required
    @IsNotEmpty()
    @IsString()
    chain: string;

    @ApiPropertyOptional({ type: String })
    cluster?: string;
}

export class ImportClusterDto {
    @ApiProperty({ type: [String] }) // Array of private keys
    @IsNotEmpty()
    @IsArray()
    @ArrayMinSize(1) // Ensures at least one private key is provided
    @IsString({ each: true }) // Validates each item in the array as a string
    privateKeys: string[];

    @ApiProperty({ type: String }) // Made required
    @IsNotEmpty()
    @IsString()
    chain: string;

    @ApiProperty({ type: String }) // Made required
    @IsNotEmpty()
    @IsString()
    cluster: string;
}

export class GenerateClusterDto {
    @ApiProperty({ type: Number })
    @IsInt()
    @Min(1)
    numOfKeys: number;

    @ApiProperty({ type: String }) // Made required
    @IsNotEmpty()
    @IsString()
    chain: string;

    @ApiProperty({ type: String }) // Made required
    @IsNotEmpty()
    @IsString()
    cluster: string;
}

export class UpdateWalletDto {
    @ApiPropertyOptional({ type: String })
    cluster?: string;
}

export class RenameClusterDto {
    @ApiProperty({ type: String }) // Made required
    @IsNotEmpty()
    @IsString()
    cluster: string;

    @ApiProperty({ type: String }) // Made required
    @IsNotEmpty()
    @IsString()
    newName: string;
}