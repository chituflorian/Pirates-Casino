import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChainType } from '../../../../blockchain/entities/chain-type.entity';
import { User } from '../../../../users/entities/user.entity';
import { Repository } from 'typeorm';
import { Wallet } from '../../../../blockchain/entities/wallet.entity';

@Injectable()
export class WalletSeedService {
  constructor(
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(ChainType)
    private chainTypeRepository: Repository<ChainType>,
  ) {}

  async run() {
    const countWallet = await this.walletRepository.count();

    if (!countWallet) {
      const user = await this.userRepository.find();
      const chainType = await this.chainTypeRepository.find();

      await this.walletRepository.save(
        this.walletRepository.create({
          id: 1,
          chainTypeId: chainType[0].id,
          address: '0x6b2CfD590E283bD0f4721bC349FdE84B9957F416',
          userId: user[0].id,
          isPrimary: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      );
    }
  }
}
