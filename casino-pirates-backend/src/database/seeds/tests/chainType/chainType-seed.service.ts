import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChainType } from '../../../../blockchain/entities/chain-type.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ChainTypeSeedService {
  constructor(
    @InjectRepository(ChainType)
    private repository: Repository<ChainType>,
  ) {}

  async run() {
    const countChainType = await this.repository.count();

    if (!countChainType) {
      await this.repository.save(
        this.repository.create({
          id: 1,
          name: 'EVM',
        }),
      );
    }
  }
}
