import { Controller, Delete, Post, Put } from "@nestjs/common";
import { ApiResponse, ApiSecurity, ApiTags } from "@nestjs/swagger";
import { UserService } from "./user.service";
import { Roles } from "src/decorators/roles.decorator";
import { UserRole } from "./user.entity";
import { UserResponseDto } from "./dtos/user.dto";
import { CreateUserDto, RemoveUserDto, RotateApiKeyDto, UpdateUserDto } from "./dtos/upsert-user.dto";

@ApiTags('User')
@ApiSecurity('x-api-secret') // Ensure Swagger includes x-api-secret
@ApiSecurity('username') // Ensure Swagger includes username
@Controller('user')
export class UserController {
    constructor(
        private readonly userService: UserService
    ){}

    @Post('/create')
    @Roles(UserRole.ADMIN)
    @ApiResponse({
        status: 201,
        type: UserResponseDto,
        description: 'User'
    })
    async createUser(params: CreateUserDto): Promise<UserResponseDto> {
        return await this.userService.createUser(params)
    }

    @Put('/update')
    @Roles(UserRole.ADMIN)
    @ApiResponse({
        status: 201,
        type: UserResponseDto,
        description: 'User'
    })
    async updateUser(params: UpdateUserDto): Promise<UserResponseDto> {
        return await this.userService.updateUser(params)
    }

    @Put('/rotate-key')
    @Roles(UserRole.ADMIN)
    @ApiResponse({
        status: 201,
        type: UserResponseDto,
        description: 'User'
    })
    async rotateApiKey(params: RotateApiKeyDto): Promise<UserResponseDto> {
        return await this.userService.rotateApiKey(params)
    }

    @Delete('/remove')
    @Roles(UserRole.ADMIN)
    @ApiResponse({
        status: 201,
        type: Boolean,
        description: 'Is user removed'
    })
    async removeUser(params: RemoveUserDto): Promise<boolean> {
        return await this.userService.removeUser(params)
    }
}