import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { CovalentResponse } from './types/covalent-response';
import { CovalentBucketResponse } from './types/covalent-bucket-response';
import { CovalentTransaction } from './types/covalent-transaction';
import axiosThrottle from 'axios-request-throttle';

@Injectable()
export class CovalentService {
  private readonly axiosInstance: AxiosInstance;

  constructor() {
    if (!process.env.COVALENT_API_KEY) {
      throw new Error('Missing COVALENT_API_KEY');
    }
    if (!process.env.COVALENT_API_URL) {
      throw new Error('Missing COVALENT_API_URL');
    }
    if (!process.env.COVALENT_API_MAX_RPS) {
      throw new Error('Missing COVALENT_API_MAX_RPS');
    }
    this.axiosInstance = axios.create({
      baseURL: process.env.COVALENT_API_URL,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${process.env.COVALENT_API_KEY}`,
      },
    });
    axiosThrottle.use(this.axiosInstance, {
      requestsPerSecond: Number(process.env.COVALENT_API_MAX_RPS ?? 5),
    });
  }

  async getTransaction(options: {
    chainSlug: string;
    transactionHash: string;
  }): Promise<CovalentResponse<CovalentTransaction> | null> {
    try {
      const response = await this.axiosInstance.get<
        CovalentResponse<CovalentTransaction>
      >(`/v1/${options.chainSlug}/transaction_v2/${options.transactionHash}/`);
      return response.data;
    } catch {
      return null;
    }
  }

  public async getInitialTimeBucket(options: {
    unixTimestamp: number;
    chainSlug: string;
    wallet: string;
    quoteCurrency: string;
  }): Promise<CovalentTransaction[] | null> {
    try {
      const response = await this.axiosInstance.get<
        CovalentResponse<CovalentBucketResponse>
      >(
        `/v1/${options.chainSlug}/bulk/transactions/${
          options.wallet
        }/${Math.floor(options.unixTimestamp / 900)}/?quote-currency=${
          options.quoteCurrency
        }`,
      );
      console.log(response.data.data.items, '******');
      return response?.data?.data?.items ?? null;
    } catch (e) {
      console.log(e, 'error ');
      return null;
    }
  }
}
