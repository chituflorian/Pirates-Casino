import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { CurrencyService } from './currency.service';
import { WrapResponse } from '../utils/decorators/wrap-response';
import { Currency } from './entities/currency.entity';
import { ChainCurrency } from './entities/chain-currency.entity';

@Controller('currency')
@WrapResponse()
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  @Get()
  async findAllCurrencies(): Promise<Currency[]> {
    return await this.currencyService.findAll();
  }

  @Get(':chainId')
  async findAllCurrenciesOnChain(
    @Param('chainId', ParseIntPipe) chainId: number,
  ): Promise<ChainCurrency[]> {
    return this.currencyService.findAllCurrenciesOnChain(chainId);
  }
}
