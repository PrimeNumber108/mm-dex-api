import { Injectable, Logger, NotFoundException, OnModuleInit } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User, UserRole } from "./user.entity";
import { CreateUserDto, RemoveUserDto, RotateApiKeyDto, UpdateUserDto } from "./dtos/upsert-user.dto";
import { randomBytes } from "crypto";
import { env } from "src/config";
import * as bcrypt from "bcrypt"; // 🔹 Import bcrypt for hashing
import { UserDto } from "./dtos/user.dto";

@Injectable()
export class UserService implements OnModuleInit {
    private readonly logger = new Logger(UserService.name);

    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>
    ) {}

    async onModuleInit() {
        const rootAdmin = await this.findUser('root-admin');
        if (!rootAdmin) {
            const rawSecret = env.keys.rootAdminApiSecret;
            const hashedSecret = await bcrypt.hash(rawSecret, 10); // 🔹 Hash API secret

            const record = this.userRepo.create({
                username: 'root-admin',
                role: UserRole.ADMIN,
                apiSecretHash: hashedSecret, // 🔹 Store hashed secret
            });
            await this.userRepo.save(record);
            this.logger.log("Created root admin successfully!");
            return;
        }
        this.logger.log("Root admin already exists!");
    }

    async findUser(username: string): Promise<User | null> {
        return await this.userRepo.findOneBy({ username });
    }

    async createUser(params: CreateUserDto): Promise<UserDto> {
        const rawSecret = randomBytes(32).toString('hex');
        const hashedSecret = await bcrypt.hash(rawSecret, 10); // 🔹 Hash the API secret before storing

        const record = this.userRepo.create({
            ...params,
            apiSecretHash: hashedSecret, // 🔹 Store hashed secret
        });

        const user = await this.userRepo.save(record);
        const { apiSecretHash, ...rest } = user;
        return {...rest, apiSecret: rawSecret};
    }

    async updateUser(params: UpdateUserDto): Promise<UserDto> {
        const existing = await this.userRepo.findOneBy({ username: params.username });
        if (!existing) throw new NotFoundException('Username not found');

        const newRecord = { ...existing };

        if (params.newName) newRecord.username = params.newName;
        if (params.role) newRecord.role = params.role;

        const { apiSecretHash, ...rest } = await this.userRepo.save(newRecord);
        return {
            ...rest,
            apiSecret: ''
        }
    }

    async rotateApiKey(params: RotateApiKeyDto): Promise<UserDto> {
        const existing = await this.userRepo.findOneBy({ username: params.username });
        if (!existing) throw new NotFoundException('Username not found');

        const newApiSecret = randomBytes(32).toString('hex');
        const hashedSecret = await bcrypt.hash(newApiSecret, 10); // 🔹 Hash the new API secret

        const newRecord = {
            ...existing,
            apiSecretHash: hashedSecret, // 🔹 Store hashed secret
        };

        const {apiSecretHash, ...rest} = await this.userRepo.save(newRecord);
        return {
            ...rest,
            apiSecret: newApiSecret
        }
    }

    async removeUser(params: RemoveUserDto): Promise<boolean> {
        return (await this.userRepo.delete(params)).affected > 0;
    }
}
