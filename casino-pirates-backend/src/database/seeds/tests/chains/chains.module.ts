import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChainType } from '../../../../blockchain/entities/chain-type.entity';
import { Chain } from '../../../../blockchain/entities/chain.entity';
import { ChainSeedService } from './chains.service';

@Module({
  imports: [TypeOrmModule.forFeature([Chain, ChainType])],
  providers: [ChainSeedService],
  exports: [ChainSeedService],
})
export class TestChainSeedModule {}
