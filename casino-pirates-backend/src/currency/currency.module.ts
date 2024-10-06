import { Module } from '@nestjs/common';
import { ChainCurrency } from './entities/chain-currency.entity';
import { Currency } from './entities/currency.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CurrencyController } from './currency.controller';
import { CurrencyService } from './currency.service';

@Module({
  imports: [TypeOrmModule.forFeature([ChainCurrency, Currency])],
  controllers: [CurrencyController],
  providers: [CurrencyService],
  exports: [CurrencyService],
})
export class CurrencyModule {}
