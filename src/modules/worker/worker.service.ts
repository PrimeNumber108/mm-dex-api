import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

import { provider } from 'src/libs/web3/provider';

@Injectable()
export class WorkerService implements OnModuleInit {
  provider = provider;
  private logger: Logger = new Logger(WorkerService.name);
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async onModuleInit() {
    this.logger.log('Worker service started');
  }
}
