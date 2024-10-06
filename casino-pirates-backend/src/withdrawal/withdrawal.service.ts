import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Withdrawal } from './entities/withdrawal.entity';
import { User } from '../users/entities/user.entity';
import { ChainCurrency } from '../currency/entities/chain-currency.entity';
import { Chain } from '../blockchain/entities/chain.entity';
import { WithdrawalStatusType } from './status-type.enum';

@Injectable()
export class WithdrawalService {
  constructor(
    @InjectRepository(Withdrawal)
    private readonly withdrawalRepository: Repository<Withdrawal>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Chain)
    private readonly chainRepository: Repository<Chain>,
    @InjectRepository(ChainCurrency)
    private readonly currencyRepository: Repository<ChainCurrency>,
  ) {}
  async createWithdrawal(
    userId: number,
    amount: number,
    chainId: number,
    currencyId: number,
  ) {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user has sufficient balance
    if (user.balance < amount) {
      throw new BadRequestException('Insufficient balance');
    }

    const chain = await this.chainRepository.findOneBy({ id: chainId });
    if (!chain) {
      throw new NotFoundException('Chain not found');
    }

    const currency = await this.currencyRepository.findOneBy({
      chainId,
      currencyId,
    });
    if (!currency) {
      throw new NotFoundException('Currency not found');
    }

    await this.withdrawalRepository.manager.transaction(
      async (transactionalEntityManager) => {
        // Deduct the withdrawal amount from the user's balance
        user.balance -= amount;
        await transactionalEntityManager.save(user);

        // Create the withdrawal request
        const withdrawal = new Withdrawal();
        withdrawal.user = user;
        withdrawal.amount = amount;
        withdrawal.chain = chain;
        withdrawal.currency = currency;
        withdrawal.status = WithdrawalStatusType.PENDING;
        withdrawal.verifiedByCronJob = false;

        await transactionalEntityManager.save(withdrawal);
      },
    );
  }
  async updateWithdrawalStatus(
    id: number,
    newStatus: WithdrawalStatusType.ACCEPTED | WithdrawalStatusType.DECLINED,
  ): Promise<Withdrawal> {
    const withdrawal = await this.withdrawalRepository.findOneBy({ id });
    if (!withdrawal) {
      throw new NotFoundException('Withdrawal request not found');
    }

    withdrawal.status = newStatus;

    if (newStatus === WithdrawalStatusType.ACCEPTED) {
      // Update the processedAt field
      withdrawal.processedAt = new Date();
    } else if (newStatus === WithdrawalStatusType.DECLINED) {
      // Handle declined withdrawal
      await this.handleDeclinedWithdrawal(id);
    }

    return this.withdrawalRepository.save(withdrawal);
  }
  async handleDeclinedWithdrawal(id: number): Promise<Withdrawal> {
    const withdrawal = await this.withdrawalRepository.findOneBy({ id });
    if (
      !withdrawal ||
      withdrawal.status !== WithdrawalStatusType.DECLINED ||
      withdrawal.verifiedByCronJob
    ) {
      throw new BadRequestException('Invalid withdrawal request');
    }

    // Return the withdrawal amount to the user's balance
    withdrawal.user.balance += withdrawal.amount;
    await this.userRepository.save(withdrawal.user);

    // Mark the withdrawal request as verified by the cron job
    withdrawal.verifiedByCronJob = true;
    return this.withdrawalRepository.save(withdrawal);
  }
  async getAllWithdrawals(): Promise<Withdrawal[]> {
    return this.withdrawalRepository.find();
  }
}
