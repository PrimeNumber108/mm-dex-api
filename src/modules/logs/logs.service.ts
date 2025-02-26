import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Logs } from './entities/logs.entity';

@Injectable()
export class LogsService {
  constructor(
    @InjectRepository(Logs)
    private readonly logRepository: Repository<Logs>,
  ) {}

  public async logger(
    status: 'error' | 'info',
    message: string,
    meta: any = null,
  ) {
    await this.logRepository.save({ status, message, meta });
  }
}
