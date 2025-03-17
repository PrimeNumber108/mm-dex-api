import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { ArrayNotEmpty, IsArray, IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { UserRole } from "../user.entity";

export class CreateUserDto {
    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    username: string;

    @ApiProperty({ enum: UserRole })
    @IsNotEmpty()
    @IsEnum(UserRole)
    role: UserRole;
}

export class RemoveUserDto {
    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    username: string;
}

export class RotateApiKeyDto {
    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    username: string;
}

export class UpdateUserDto {
    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    username: string;

    @ApiPropertyOptional({ type: String })
    newName?: string;

    @ApiPropertyOptional({ enum: UserRole })
    @IsEnum(UserRole)
    role?: UserRole;

    @ApiPropertyOptional({ type: [String] })
    @IsOptional()
    @IsArray()
    @ArrayNotEmpty() // Ensures that the array is not empty if provided
    @IsString({ each: true }) // Ensures all elements in the array are strings
    allowedClusters?: string[];
}