import { Module } from '@nestjs/common';
import { DepositController } from './deposit.controller';
import { DepositService } from './deposit.service';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { CurrencyModule } from '../currency/currency.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from '../blockchain/entities/transaction.entity';
import { CovalentModule } from '../covalent/covalent.module';
@Module({
  imports: [
    BlockchainModule,
    CurrencyModule,
    CovalentModule,
    TypeOrmModule.forFeature([Transaction]),
  ],
  controllers: [DepositController],
  providers: [DepositService],
  exports: [DepositService],
})
export class DepositModule {}
