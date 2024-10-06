import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { GemsResDTO } from './dto/GemsResDTO';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { PlatformConfigService } from '../config/platformconfig/platformconfig.service';
import { User } from '../users/entities/user.entity';
import { EntityManager, Repository } from 'typeorm';
import { Gems } from './entities/gems.entity';
import { GamesHistoryService } from '../games-history/games-history.service';
import { GAME_TYPE } from '../games-history/entities/games-history.entity';
import { v4 as uuidv4 } from 'uuid';
@Injectable()
export class GemsService {
  constructor(
    private readonly platformConfigService: PlatformConfigService,
    private readonly gameHistoryService: GamesHistoryService,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Gems)
    private gemsRepository: Repository<Gems>,
  ) {}

  public winningArrays = {
    7: ['a', 'a', 'a', 'a', 'a'],
    6: ['a', 'a', 'a', 'a', 'b'],
    5: ['a', 'a', 'a', 'b', 'b'],
    4: ['a', 'a', 'a', 'b', 'c'],
    3: ['a', 'a', 'b', 'b', 'c'],
    2: ['a', 'a', 'b', 'c', 'd'],
    1: ['a', 'b', 'c', 'd', 'e'],
  };

  public multipliers = {
    EASY: {
      7: 4,
      6: 2,
      5: 1.6,
      4: 1.3,
      3: 1.2,
      2: 1,
      1: 0,
    },
    MEDIUM: {
      7: 50,
      6: 7,
      5: 4,
      4: 3,
      3: 2,
      2: 0,
      1: 0,
    },
    HARD: {
      7: 80,
      6: 10,
      5: 7,
      4: 5,
      3: 0,
      2: 0,
      1: 0,
    },
  };

  public probabilities = {
    EASY: {
      7: 0.02,
      6: 0.03,
      5: 0.04,
      4: 0.12,
      3: 0.27,
      2: 0.37,
      1: 0.15,
    },
    MEDIUM: {
      7: 0.01,
      6: 0.02,
      5: 0.04,
      4: 0.05,
      3: 0.25,
      2: 0.5,
      1: 0.13,
    },
    HARD: {
      7: 0.01,
      6: 0.01,
      5: 0.02,
      4: 0.03,
      3: 0.39,
      2: 0.29,
      1: 0.25,
    },
  };

  public async create(
    id: number,
    difficulty: string,
    betAmount: number,
  ): Promise<GemsResDTO> {
    return this.entityManager.transaction(
      async (transactionalEntityManager) => {
        try {
          const user = await transactionalEntityManager.findOneBy(User, {
            id,
          });

          if (!user) {
            throw new UnauthorizedException('User not found');
          }
          const maxBet: number = Number(
            await this.platformConfigService.get('gems.MaxAmount'),
          );
          const minBet: number = Number(
            await this.platformConfigService.get('gems.MinAmount'),
          );
          const status = this.platformConfigService.get('gems.Status');
          if (!status) {
            throw new BadRequestException('Game is not active');
          }
          if (betAmount > maxBet) {
            throw new BadRequestException('Maximum bet exceeded');
          }

          if (betAmount < minBet) {
            throw new BadRequestException('Minimum bet not reached');
          }

          if (Number(user.balance) < Number(betAmount)) {
            throw new BadRequestException('Insufficient balance');
          }

          // await transactionalEntityManager.increment(
          //   User,
          //   { id },
          //   'totalWager',
          //   betAmount,
          // );
          // await transactionalEntityManager.increment(
          //   User,
          //   { id },
          //   'experience',
          //   betAmount,
          // );

          const maxWin: number = Number(
            await this.platformConfigService.get('gems.MaxWin'),
          );
          const { prize, multiplier, state } = this.generatePrize(difficulty);

          const profit: number =
            betAmount * multiplier > maxWin ? maxWin : betAmount * multiplier;

          if (profit > 0) {
            const netProfit = profit - betAmount;
            await transactionalEntityManager.increment(
              User,
              { id },
              'balance',
              netProfit,
            );
          } else {
            await transactionalEntityManager.decrement(
              User,
              { id },
              'balance',
              betAmount,
            );
          }

          const generatedGems: string[] = this.generateGems(
            this.winningArrays[prize],
          );
          const copyGenerated: string[] = [...generatedGems];
          const finalArray: string[] = [];

          for (let i = 0; i < generatedGems.length; i++) {
            const randomIndex = Math.floor(
              Math.random() * copyGenerated.length,
            );
            finalArray.push(copyGenerated[randomIndex]);
            copyGenerated.splice(randomIndex, 1);
          }
          const dictionary: { [key: string]: number } = {};
          for (let i = 0; i < finalArray.length; i++) {
            if (dictionary[finalArray[i]]) {
              dictionary[finalArray[i]] += 1;
            } else {
              dictionary[finalArray[i]] = 1;
            }
          }

          const indexBet: number[] = [];
          for (let i = 0; i < finalArray.length; i++) {
            if (dictionary[finalArray[i]] > 1) {
              indexBet.push(1);
            } else {
              indexBet.push(0);
            }
          }
          const profitArrays: string[][] = [];
          for (const key of Object.keys(dictionary)) {
            if (dictionary[key] === 2) {
              profitArrays.push([key, key]);
            }
            if (dictionary[key] === 3) {
              profitArrays.push([key, key, key]);
            }
            if (dictionary[key] === 4) {
              profitArrays.push([key, key, key, key]);
            }
            if (dictionary[key] === 5) {
              profitArrays.push([key, key, key, key, key]);
            }
          }
          profitArrays.sort((a, b) => b.length - a.length);
          const gameId = uuidv4();
          await transactionalEntityManager.save(Gems, {
            generatedGems: JSON.stringify(generatedGems),
            prize,
            betAmount,
            profit,
            multiplier,
            state,
            difficulty,
            user,
          });
          await this.gameHistoryService.addGameToUserHistory(
            id,
            gameId,
            profit,
            GAME_TYPE.GEMS,
            transactionalEntityManager,
          );
          return {
            success: true,
            betId: uuidv4(),
            initialBet: finalArray,
            indexBet: indexBet,
            profit: profitArrays.length === 0 ? [[]] : profitArrays,
          } as GemsResDTO;
        } catch (error) {
          throw error;
        }
      },
    );
  }

  private generatePrize = (
    difficulty: string,
  ): { prize: number; multiplier: number; state: string } => {
    const random = Math.random();
    let selectedNumber = 1;
    for (const number in this.probabilities[difficulty]) {
      if (random < this.probabilities[difficulty][number]) {
        selectedNumber = Number(number);
      }
    }

    let state = 'LOSE';

    if (this.multipliers[difficulty][selectedNumber] > 0) {
      state = 'WIN';
    }

    const winningMultiplier = this.multipliers[difficulty][selectedNumber];

    return {
      prize: selectedNumber,
      multiplier: winningMultiplier,
      state: state,
    };
  };

  private generateGems(array: string[]): string[] {
    const gems: string[] = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
    const uniqueGems: string[] = [...new Set(array).values()];
    let joinedArray: string = array.join('');

    while (uniqueGems.length > 0) {
      const gemToReplace: string = uniqueGems.pop()!;
      let randomIndex: number;
      do {
        randomIndex = Math.floor(Math.random() * gems.length);
      } while (joinedArray.includes(gems[randomIndex]));

      joinedArray = joinedArray.replaceAll(gemToReplace, gems[randomIndex]);
    }

    const generatedGems: string[] = joinedArray.split('');
    generatedGems.sort(() => Math.random() - 0.5);
    return generatedGems;
  }

  public async getGame(id: number) {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const game = await this.gemsRepository.findOne({
      where: {
        user: { id },
      },
      order: { createdAt: 'DESC' },
    });

    if (!game) {
      return {
        success: false,
        game: {},
      };
    } else {
      return {
        success: true,
        game,
      };
    }
  }

  public async getMultiplier(id: number) {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.multipliers;
  }
}
