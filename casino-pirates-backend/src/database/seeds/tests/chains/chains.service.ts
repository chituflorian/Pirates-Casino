import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Chain } from '../../../../blockchain/entities/chain.entity';
import { ChainType } from '../../../../blockchain/entities/chain-type.entity';

@Injectable()
export class ChainSeedService {
  constructor(
    @InjectRepository(ChainType)
    private readonly chainTypeRepository: Repository<ChainType>,
    @InjectRepository(Chain)
    private readonly chainRepository: Repository<Chain>,
  ) {}

  async run() {
    // Add your seed data here
    const chainType = await this.chainTypeRepository.find();
    const chainData = [
      {
        chainTypeId: chainType[0].id,
        rpc_url: 'https://eth-sepolia-1.gochain.io',
        isActive: true,
        depositAddress: '0x59c48fb3b6260D6611a606CACEa2D9470C9c3192',
        slug: 'eth-sepolia',
        cronCheckDeposit: '*/15 * * * * *',
        lastCheckedBlock: new Date(),
      },
    ];
    const countChainCurrency = await this.chainRepository.count();
    if (!countChainCurrency) {
      for (const data of chainData) {
        await this.chainRepository.save(this.chainRepository.create(data));
      }
    }
  }
}
