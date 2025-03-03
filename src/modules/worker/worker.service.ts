import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';


@Injectable()
export class WorkerService implements OnModuleInit {
  private logger: Logger = new Logger(WorkerService.name);
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async onModuleInit() {
    this.logger.log('Worker service started');
  }
}
