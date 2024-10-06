import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { User } from '../users/entities/user.entity';
import { EntityManager, Repository } from 'typeorm';
import { PlatformConfigService } from '../config/platformconfig/platformconfig.service';
import { GAME_TYPE } from '../games-history/entities/games-history.entity';

export abstract class BaseGameService {
  constructor(
    protected readonly platformConfigService: PlatformConfigService,
    protected readonly usersRepository: Repository<User>,
    protected readonly gameType: number,
  ) {}

  protected validateUserBalance(user: User, amount: number) {
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (Number(user.balance) < Number(amount)) {
      throw new BadRequestException('Insufficient balance');
    }
  }

  protected async validateBetAmount(amount: number): Promise<void> {
    const maxBet = Number(
      await this.platformConfigService.get(
        `${GAME_TYPE[this.gameType].toLowerCase()}.MaxAmount`,
      ),
    );
    const minBet = Number(
      await this.platformConfigService.get(
        `${GAME_TYPE[this.gameType].toLocaleLowerCase()}.MinAmount`,
      ),
    );
    const status = await this.platformConfigService.get(
      `${GAME_TYPE[this.gameType].toLowerCase()}.Status`,
    );

    if (!status) {
      throw new BadRequestException('Game is not active');
    }

    if (amount > maxBet) {
      throw new BadRequestException('Maximum bet exceeded');
    }

    if (amount < minBet) {
      throw new BadRequestException('Minimum bet not reached');
    }
  }

  protected async updateBalanceForNewGame(
    userId: number,
    amount: number,
    transactionalEntityManager: EntityManager,
  ): Promise<void> {
    await transactionalEntityManager
      .createQueryBuilder()
      .update(User)
      .set({
        balance: () => `balance - ${amount}`,
        // totalWager: () => `totalWager + ${amount}`,
        // experience: () => `experience + ${amount}`,
      })
      .where('id = :id', { id: userId })
      .execute();
  }
}
