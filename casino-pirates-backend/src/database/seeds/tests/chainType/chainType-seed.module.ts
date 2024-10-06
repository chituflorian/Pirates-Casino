import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChainTypeSeedService } from './chainType-seed.service';
import { ChainType } from '../../../../blockchain/entities/chain-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ChainType])],
  providers: [ChainTypeSeedService],
  exports: [ChainTypeSeedService],
})
export class TestChainTypeSeedModule {}
