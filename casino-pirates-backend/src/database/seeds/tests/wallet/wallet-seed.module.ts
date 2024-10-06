import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../../../users/entities/user.entity';
import { WalletSeedService } from './wallet-seed.service';
import { Wallet } from '../../../../blockchain/entities/wallet.entity';
import { ChainType } from '../../../../blockchain/entities/chain-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Wallet, ChainType])],
  providers: [WalletSeedService],
  exports: [WalletSeedService],
})
export class TestWalletSeedModule {}
