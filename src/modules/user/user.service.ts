import { Injectable, Logger, NotFoundException, OnModuleInit } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User, UserRole } from "./user.entity";
import { CreateUserDto, RemoveUserDto, RotateApiKeyDto, UpdateUserDto } from "./dtos/upsert-user.dto";
import { randomBytes } from "crypto";
import { env } from "src/config";
import * as bcrypt from "bcrypt"; // 🔹 Import bcrypt for hashing
import { UserDto } from "./dtos/user.dto";
import { InjectRedis } from "@nestjs-modules/ioredis";
import Redis from "ioredis";

@Injectable()
export class UserService implements OnModuleInit {
    private readonly logger = new Logger(UserService.name);

    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        @InjectRedis() private readonly redis: Redis
    ) { }

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

    private userRedisKey(username: string) {
        return `User:${username}`;
    }

    private async cacheUser(user: User) {
        await this.redis.set(this.userRedisKey(user.username), JSON.stringify(user), 'EX', 900);
    }

    private async getCachedUser(username: string) {
        const cached = await this.redis.get(this.userRedisKey(username));
        if (!cached) return null;
        return JSON.parse(cached) as User;
    }

    async findUser(username: string): Promise<User | null> {
        const cached = await this.getCachedUser(username);
        if (cached) return cached;
        const user = await this.userRepo.findOneBy({ username });
        if (!user) return null;

        await this.cacheUser(user);
        return user;
    }

    async createUser(params: CreateUserDto): Promise<UserDto> {
        const rawSecret = randomBytes(32).toString('hex');
        const hashedSecret = await bcrypt.hash(rawSecret, 10); // 🔹 Hash the API secret before storing

        const record = this.userRepo.create({
            ...params,
            apiSecretHash: hashedSecret, // 🔹 Store hashed secret
        });

        const user = await this.userRepo.save(record);

        await this.cacheUser(user);
        const { apiSecretHash, ...rest } = user;
        return { ...rest, apiSecret: rawSecret };
    }

    async updateUser(params: UpdateUserDto): Promise<UserDto> {
        const existing = await this.userRepo.findOneBy({ username: params.username });
        if (!existing) throw new NotFoundException('Username not found');

        const newRecord = { ...existing };

        if (params.newName) newRecord.username = params.newName;
        if (params.role) newRecord.role = params.role;

        const user = await this.userRepo.save(newRecord);
        await this.cacheUser(user);

        const { apiSecretHash, ...rest } = user
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

        const user = await this.userRepo.save(newRecord);
        await this.cacheUser(user);

        const { apiSecretHash, ...rest } = user;
        return {
            ...rest,
            apiSecret: newApiSecret
        }
    }

    async removeUser(params: RemoveUserDto): Promise<boolean> {
        const deleteResult = await this.userRepo.delete(params);
        if (deleteResult.affected > 0) {
            await this.redis.del(this.userRedisKey(params.username)); // Remove cached user
            return true;
        }
        return false;
    }
}
