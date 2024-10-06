import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Currency } from '../../../../currency/entities/currency.entity';

@Injectable()
export class CurrencySeedService {
  constructor(
    @InjectRepository(Currency)
    private readonly currencyRepository: Repository<Currency>,
  ) {}

  async run() {
    // Add your seed data here
    const currencyData = [
      {
        cmcId: 1,
        priceUsd: 100,
        price: 100,
        imageUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1.png',
        name: 'ETH',
      },
    ];
    const countCurrency = await this.currencyRepository.count();
    if (!countCurrency) {
      for (const data of currencyData) {
        await this.currencyRepository.save(
          this.currencyRepository.create(data),
        );
      }
    }
  }
}
