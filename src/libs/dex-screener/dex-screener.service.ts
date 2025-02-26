import { Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { PairsResponse } from './response-example';
import { NATIVE_ADDRESS } from 'src/utils/constant';
export class DexScreenerService {
  private readonly dexScreenerApiClient: AxiosInstance;
  private readonly logger = new Logger(DexScreenerService.name);

  constructor() {
    this.dexScreenerApiClient = axios.create({
      baseURL: `https://api.dexscreener.com/`,
      headers: {
        'content-type': 'application/json',
      },
    });
  }
}

export const dexScreenerService = new DexScreenerService();
