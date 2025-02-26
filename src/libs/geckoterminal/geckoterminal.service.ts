import { Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { AnalyticPoolData, GeckoTerminalResponse } from './response-example';

export class GeckoTerminalService {
  private readonly geckoTerminalApiClient: AxiosInstance;
  private readonly logger = new Logger(GeckoTerminalService.name);

  constructor() {
    this.geckoTerminalApiClient = axios.create({
      baseURL: `https://api.geckoterminal.com/api/v2`,
      headers: {
        'content-type': 'application/json',
      },
    });
  }
}

export const geckoTerminalService = new GeckoTerminalService();
