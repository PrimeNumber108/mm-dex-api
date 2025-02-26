import { Module } from '@nestjs/common';
import { WorkerService } from './worker.service';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import dataSource from 'src/libs/typeorm.config';
import { RedisModule } from '@nestjs-modules/ioredis';
import { env } from 'src/config';
import { HealthCheckModule } from '../health-check/health-check.module';

import { LogsModule } from '../logs/logs.module';
import { LogsService } from '../logs/logs.service';
import { Logs } from '../logs/entities/logs.entity';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot(dataSource.options),
    RedisModule.forRoot({
      type: 'single',
      url: env.redis.url,
      options: {},
    }),
    TypeOrmModule.forFeature([Logs]),
    HealthCheckModule,
    LogsModule,
  ],
  providers: [WorkerService, LogsService],
})
export class WorkerModule {}
