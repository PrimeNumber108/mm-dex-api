import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InjectRedis, RedisModule } from '@nestjs-modules/ioredis';
import { env } from 'src/config';
import { HealthCheckModule } from './health-check/health-check.module';
import dataSource from 'src/libs/typeorm.config';
import Redis from 'ioredis';
import { UserModule } from './user/user.module';
import { TokenModule } from './token/token.module';
import { WalletModule } from './wallet/wallet.module';
import { OrderModule } from './order/order.module';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './auth/guards/roles.guard';
import { AuthModule } from './auth/auth.module';
import { PairModule } from './pair/pair.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true }),
    TypeOrmModule.forRoot(dataSource.options),
    RedisModule.forRoot({
      type: 'single',
      url: `redis://${env.redis.host}:6379`,
      options: {
        password: env.redis.password
      },
    }),
    HealthCheckModule,
    UserModule,
    AuthModule,
    TokenModule,
    PairModule,
    WalletModule,
    OrderModule,
  ],

  providers: [
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule implements OnModuleInit {
  constructor(@InjectRedis() private readonly redis: Redis) { }

  async onModuleInit() { }
}
