import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChainCurrency } from './entities/chain-currency.entity';
import { Repository } from 'typeorm';
import { Currency } from './entities/currency.entity';

@Injectable()
export class CurrencyService {
  constructor(
    @InjectRepository(ChainCurrency)
    private readonly chainCurrencyRepository: Repository<ChainCurrency>,
    @InjectRepository(Currency)
    private readonly currencyRepository: Repository<Currency>,
  ) {}

  async findAll(): Promise<Currency[]> {
    return await this.currencyRepository.find();
  }

  async findAllCurrenciesOnChain(chainId: number): Promise<ChainCurrency[]> {
    return this.chainCurrencyRepository.find({
      where: { chainId },
      relations: ['currency'],
    });
  }
}
