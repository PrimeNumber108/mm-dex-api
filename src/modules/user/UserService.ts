import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./user.entity";
import { UserDto, UserPublicDto } from "./dtos/user.dto";
import { CreateUserDto, RemoveUserDto, RotateApiKeyDto, UpdateUserDto } from "./dtos/upsert-user.dto";
import { randomBytes } from "crypto";

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>
    ) {

    }

    async findUser(username: string): Promise<UserDto> {
        return await this.userRepo.findOneBy({ username });
    }

    async createUser(params: CreateUserDto): Promise<UserPublicDto> {
        const rawSecret = randomBytes(32).toString('hex');
        const record = this.userRepo.create({...params, apiSecret: rawSecret});
        const user = await this.userRepo.save(record);
        const {
            apiSecret,
            ...rest
        } = user;
        return rest;
    }

    async updateUser(params: UpdateUserDto): Promise<UserPublicDto> {
        const existing = await this.userRepo.findOneBy({username: params.username});
        if(!existing) throw new NotFoundException('Username not found');

        const newRecord = {
            ...existing,
        }

        if(params.newName) newRecord.username = params.newName;
        if(params.role) newRecord.role = params.role;

        return await this.userRepo.save(newRecord);
    }

    async rotateApiKey(params: RotateApiKeyDto): Promise<UserPublicDto> {
        const existing = await this.userRepo.findOneBy({username: params.username});
        if(!existing) throw new NotFoundException('Username not found');
        
        const newApiSecret = randomBytes(32).toString('hex');
        const newRecord = {
            ...existing,
            apiSecret: newApiSecret
        };

        return await this.userRepo.save(newRecord);
    }

    async removeUser(params: RemoveUserDto): Promise<boolean> {
        return (await this.userRepo.delete(params)).affected > 0
    }
}