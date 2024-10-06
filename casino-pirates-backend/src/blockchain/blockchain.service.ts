import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Chain } from './entities/chain.entity';
import { ChainType } from './entities/chain-type.entity';
import { ChainTypeEnum } from './chain-type.enum';
import { verifyMessage } from 'ethers';
import NodeCache from 'node-cache';

@Injectable()
export class BlockchainService {
  private readonly baseMessage = `Blah blah`; // TODO: add message to config

  private readonly nodeCache = new NodeCache({
    stdTTL: 50, // 50 seconds
    checkperiod: 2, // check every 2 seconds for expired keys
    maxKeys: 1000, //if there are more than 1000 auth sessions in progress at the same time, forbid new ones
  });

  constructor(
    @InjectRepository(ChainType)
    private readonly chainTypeRepository: Repository<ChainType>,
    @InjectRepository(Chain)
    private readonly chainRepository: Repository<Chain>,
  ) {}

  async getAvailableChains(chainNames: ChainTypeEnum[]): Promise<Chain[]> {
    const chainType = await this.chainTypeRepository.findOneOrFail({
      where: { name: In(chainNames) },
      relations: ['chains'],
    });
    return chainType.chains.filter((chain) => chain.isActive);
  }

  async getChainById(chainId: number): Promise<Chain> {
    return this.chainRepository.findOneOrFail({
      where: { id: chainId },
    });
  }

  public addWalletToCache(walletAddress: string): string {
    const randomString = Math.random().toString(36).substring(2, 10);
    this.nodeCache.set<string>(walletAddress, this.baseMessage + randomString);
    return this.baseMessage + randomString;
  }

  public getMessageFromCache(walletAddress: string): string | undefined {
    return this.nodeCache.get<string>(walletAddress);
  }

  public verifyEvmSignature(
    signature: string,
    walletAddress: string,
    message: string,
  ): boolean {
    try {
      const signerAddress = verifyMessage(message, signature);
      const result =
        signerAddress.toLowerCase() === walletAddress.toLowerCase();
      if (result) {
        this.nodeCache.del(walletAddress);
      }
      return result;
    } catch (error) {
      console.error('Error verifying signature:', error);
      return false;
    }
  }
}
