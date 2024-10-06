import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChainCurrencySeedService } from './chain_currencies.service';
import { ChainCurrency } from '../../../../currency/entities/chain-currency.entity';
import { Chain } from '../../../../blockchain/entities/chain.entity';
import { Currency } from '../../../../currency/entities/currency.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ChainCurrency, Chain, Currency])],
  providers: [ChainCurrencySeedService],
  exports: [ChainCurrencySeedService],
})
export class TestChainCurrencySeedModule {}
