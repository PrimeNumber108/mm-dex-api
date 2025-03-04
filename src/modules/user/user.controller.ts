import { Body, Controller, Delete, Post, Put } from "@nestjs/common";
import { ApiResponse, ApiSecurity, ApiTags } from "@nestjs/swagger";
import { UserService } from "./user.service";
import { Roles } from "src/decorators/roles.decorator";
import { UserRole } from "./user.entity";
import { CreateUserDto, RemoveUserDto, RotateApiKeyDto, UpdateUserDto } from "./dtos/upsert-user.dto";
import { UserDto } from "./dtos/user.dto";

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
        type: UserDto,
        description: 'User'
    })
    async createUser(@Body() params: CreateUserDto): Promise<UserDto> {
        return await this.userService.createUser(params)
    }

    @Put('/update')
    @Roles(UserRole.ADMIN)
    @ApiResponse({
        status: 201,
        type: UserDto,
        description: 'User'
    })
    async updateUser(@Body() params: UpdateUserDto): Promise<UserDto> {
        return await this.userService.updateUser(params)
    }

    @Put('/rotate-key')
    @Roles(UserRole.ADMIN)
    @ApiResponse({
        status: 201,
        type: UserDto,
        description: 'User'
    })
    async rotateApiKey(@Body() params: RotateApiKeyDto): Promise<UserDto> {
        return await this.userService.rotateApiKey(params)
    }

    @Delete('/remove')
    @Roles(UserRole.ADMIN)
    @ApiResponse({
        status: 201,
        type: Boolean,
        description: 'Is user removed'
    })
    async removeUser(@Body() params: RemoveUserDto): Promise<boolean> {
        return await this.userService.removeUser(params)
    }
}