import { Injectable } from '@nestjs/common';
import { ChainCurrency } from '../../../../currency/entities/chain-currency.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Chain } from '../../../../blockchain/entities/chain.entity';
import { Currency } from '../../../../currency/entities/currency.entity';

@Injectable()
export class ChainCurrencySeedService {
  constructor(
    @InjectRepository(ChainCurrency)
    private readonly chainCurrencyRepository: Repository<ChainCurrency>,
    @InjectRepository(Chain)
    private readonly chainRepository: Repository<Chain>,
    @InjectRepository(Currency)
    private readonly currencyRepository: Repository<Currency>,
  ) {}

  async run() {
    const chain = await this.chainRepository.find();
    const currency = await this.currencyRepository.find();
    // Add your seed data here
    const chainCurrencyData = [
      {
        chainId: chain[0].id,
        address: '0x59c48fb3b6260D6611a606CACEa2D9470C9c3192',
        currencyId: currency[0].id,
      },
    ];
    const countChainCurrency = await this.chainCurrencyRepository.count();
    if (!countChainCurrency) {
      for (const data of chainCurrencyData) {
        await this.chainCurrencyRepository.save(
          this.chainCurrencyRepository.create(data),
        );
      }
    }
  }
}
