import { Module } from '@nestjs/common';
import { WithdrawalService } from './withdrawal.service';
import { WithdrawalController } from './withdrawal.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chain } from '../blockchain/entities/chain.entity';
import { ChainCurrency } from '../currency/entities/chain-currency.entity';
import { Withdrawal } from './entities/withdrawal.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Withdrawal, User, Chain, ChainCurrency])],
  controllers: [WithdrawalController],
  providers: [WithdrawalService],
  exports: [WithdrawalService],
})
export class WithdrawalModule {}
