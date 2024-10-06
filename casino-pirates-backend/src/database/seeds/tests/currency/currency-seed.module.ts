import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CurrencySeedService } from './currency-seed.service';
import { Currency } from '../../../../currency/entities/currency.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Currency])],
  providers: [CurrencySeedService],
  exports: [CurrencySeedService],
})
export class TestCurrencySeedModule {}
