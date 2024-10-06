import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateTowerRespDTO } from './dto/CreateTowerRespDTO';
import {
  OpenTileUnSafeBlockResDTO,
  OpenTileSafeBlockResDTO,
  OpenTileResDTO,
  OpenTileSafeBlockCashedOutResDTO,
} from './dto/OpenTileResDTO';
import { PlatformConfigService } from '../config/platformconfig/platformconfig.service';
import { EntityManager, Repository } from 'typeorm';
import { Tower } from './entities/tower.entity';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { v4 as uuidv4 } from 'uuid';
import { error } from 'console';
import { GAME_TYPE } from '../games-history/entities/games-history.entity';
import { GamesHistoryService } from '../games-history/games-history.service';
import { IGameService } from '../utils/interface/ihhtp-api-service';
import { ITower } from './interface/ITower.interface';
import { BaseGameService } from '../utils/game-service';
@Injectable()
export class TowerService extends BaseGameService implements IGameService {
  constructor(
    platformConfigService: PlatformConfigService,
    private readonly gameHistoryService: GamesHistoryService,
    @InjectRepository(Tower)
    private readonly towerRepository: Repository<Tower>,
    @InjectRepository(User)
    usersRepository: Repository<User>,
    @InjectEntityManager() private readonly entityManager: EntityManager,
  ) {
    super(platformConfigService, usersRepository, GAME_TYPE.TOWER);
  }

  public async getMultiplier(id: number): Promise<Record<string, number[]>> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return difficultyStepsMap;
  }

  public async create(
    id: number,
    betAmount: number,
    difficulty: string,
  ): Promise<CreateTowerRespDTO> {
    return await this.entityManager.transaction(
      async (transactionalEntityManager) => {
        try {
          const user = await transactionalEntityManager.findOneByOrFail(User, {
            id,
          });

          await this.validateBetAmount(betAmount);

          await this.validateUserBalance(user, betAmount);

          if (Number(user.balance) < Number(betAmount)) {
            throw new BadRequestException('Insufficient balance');
          }
          const gameInProgress: Tower | null =
            await transactionalEntityManager.findOne(Tower, {
              where: {
                user: { id },
                state: 'IN_PROGRESS',
              },
              order: {
                createdAt: 'DESC',
              },
            });

          if (gameInProgress) {
            throw new BadRequestException(
              'You already have a game in progress',
            );
          }

          const gameId: string = uuidv4();

          const userMap = generateOpenedMap(difficulty);
          const gameMap = generateGameMap(difficulty);

          const game = await transactionalEntityManager.save(Tower, {
            gameId,
            generatedMap: gameMap,
            userMap,
            profitSteps: difficultyStepsMap[difficulty],
            tilesOpened: 0,
            activeRow: difficultyStepsMap[difficulty].length - 1,
            betAmount,
            user,
            state: 'IN_PROGRESS',
            difficulty,
          });

          await this.updateBalanceForNewGame(
            id,
            betAmount,
            transactionalEntityManager,
          );

          return {
            success: true,
            id: game.id,
            gameId: gameId,
            userMap: userMap,
            profitSteps: difficultyStepsMap[difficulty],
            difficulty: difficulty,
            state: 'IN_PROGRESS',
          } as CreateTowerRespDTO;
        } catch (error) {
          throw error;
        }
      },
    );
  }

  public async cashout(id: number): Promise<ITower> {
    return this.entityManager.transaction(
      async (transactionalEntityManager) => {
        try {
          const user = await transactionalEntityManager.findOneBy(User, {
            id,
          });
          if (!user) {
            throw new UnauthorizedException('User not found');
          }

          const game = await transactionalEntityManager.findOne(Tower, {
            where: {
              user: { id: id },
              state: 'IN_PROGRESS',
            },
            order: {
              createdAt: 'DESC',
            },
          });
          if (!game) {
            throw new BadRequestException('Game not found');
          }

          if (game.tilesOpened === 0) {
            throw new BadRequestException('You have not opened any tiles yet');
          }

          if (game.state !== 'IN_PROGRESS') {
            throw new BadRequestException('Game is not in progress');
          }

          const gameUserId = game.user.id;
          if (gameUserId !== id) {
            throw new UnauthorizedException(
              'You are not the owner of this game',
            );
          }

          let profit = game.profit;

          const maxWin = await Number(
            this.platformConfigService.get('tower.MaxWin'),
          );
          if (profit > maxWin) {
            profit = maxWin;
          }

          await transactionalEntityManager.update(
            Tower,
            { id: game.id },
            {
              state: 'CASHED_OUT',
              difficulty: game.difficulty,
              profit,
            },
          );

          await this.gameHistoryService.addGameToUserHistory(
            id,
            game.gameId,
            profit,
            GAME_TYPE.TOWER,
            transactionalEntityManager,
          );

          ///save profit to database
          if (profit > 0) {
            await transactionalEntityManager.increment(
              User,
              { id },
              'balance',
              profit,
            );
          } else {
            await transactionalEntityManager.increment(
              User,
              { id },
              'balance',
              game.betAmount,
            );
          }

          return { success: true, game };
        } catch (error) {
          throw error;
        }
      },
    );
  }

  public async openTile(
    id: number,
    gameId: string,
    tilePosition: number,
  ): Promise<OpenTileResDTO | never> {
    return this.entityManager.transaction(
      async (transactionalEntityManager) => {
        try {
          const user = await transactionalEntityManager.findOneBy(User, {
            id,
          });
          if (!user) {
            throw new UnauthorizedException('User not found');
          }
          const game = await transactionalEntityManager.findOneBy(Tower, {
            gameId,
          });
          if (!game) {
            throw new BadRequestException('Game not found');
          }
          if (game.state !== 'IN_PROGRESS') {
            throw new BadRequestException('Game is not in progress');
          }
          const gameUserId = game.user.id;
          if (gameUserId !== id) {
            throw new UnauthorizedException(
              'You are not the owner of this game',
            );
          }

          validTile(tilePosition, game.difficulty);

          const multiplier = game.profitSteps[game.tilesOpened];
          let profit = game.betAmount * multiplier;
          const activeRow: number = game.tilesOpened + 1;
          game.userMap;

          const { openHistoryMap, adjustedActiveRow } = checkBlockSafety(
            tilePosition,
            game.generatedMap,
            game.userMap,
            activeRow,
          );
          if (
            openHistoryMap[openHistoryMap.length - activeRow][tilePosition] ===
            TOWER
          ) {
            await transactionalEntityManager.update(
              Tower,
              { id: game.id },
              {
                userMap: openHistoryMap,
                tilesOpened: game.tilesOpened + 1,
                activeRow: adjustedActiveRow,
                profit: 0,
                state: 'LOST',
              },
            );
            await this.gameHistoryService.addGameToUserHistory(
              id,
              game.gameId,
              profit,
              GAME_TYPE.TOWER,
              transactionalEntityManager,
            );
            return {
              success: true,
              gameOver: true,
              blockPosition: tilePosition,
              isTower: true,
              userMap: openHistoryMap,
              generatedMap: game.generatedMap,
              state: 'LOST',
              activeRow: null,
              profit: 0,
              multiplier: 0,
            } as OpenTileUnSafeBlockResDTO;
          } else if (game.tilesOpened === game.generatedMap.length - 1) {
            const maxWin = Number(
              await this.platformConfigService.get('tower.MaxWin'),
            );
            if (profit > maxWin) {
              profit = maxWin;
            }
            await this.entityManager.update(
              Tower,
              { id: game.id },
              {
                userMap: openHistoryMap,
                tilesOpened: game.tilesOpened + 1,
                activeRow: adjustedActiveRow,
                profit,
                state: 'CASHED_OUT',
              },
            );
            await transactionalEntityManager.increment(
              User,
              { id },
              'balance',
              profit,
            );
            return {
              success: true,
              gameOver: true,
              blockPosition: tilePosition,
              isTower: false,
              userMap: openHistoryMap,
              generatedMap: game.generatedMap,
              state: 'CASHED_OUT',
              activeRow: adjustedActiveRow,
              profit,
              multiplier,
            } as OpenTileSafeBlockCashedOutResDTO;
          } else if (
            openHistoryMap[openHistoryMap.length - activeRow][tilePosition] ===
            SAFE
          ) {
            await this.entityManager.update(
              Tower,
              { id: game.id },
              {
                userMap: openHistoryMap,
                tilesOpened: game.tilesOpened + 1,
                activeRow: adjustedActiveRow,
                profit,
                multiplier,
                state: 'IN_PROGRESS',
              },
            );
            return {
              success: true,
              gameOver: false,
              blockPosition: tilePosition,
              isTower: false,
              userMap: openHistoryMap,
              state: 'IN_PROGRESS',
              activeRow: adjustedActiveRow - 1,
              profit,
              multiplier,
            } as OpenTileSafeBlockResDTO;
          } else {
            throw error;
          }
        } catch (error) {
          throw error;
        }
      },
    );
  }

  public async getGame(id: number) {
    return await this.towerRepository.findOne({
      where: {
        user: { id },
        state: 'IN_PROGRESS',
      },
      order: { createdAt: 'DESC' },
      select: [
        'id',
        'gameId',
        'userMap',
        'profitSteps',
        'tilesOpened',
        'activeRow',
        'initialBet',
        'betAmount',
        'profit',
        'multiplier',
        'difficulty',
        'state',
        'createdAt',
        'updatedAt',
      ],
    });
  }
}

const difficultyToSafeBlocks: Record<
  string,
  { safeBlocks: number; towers: number }
> = {
  EASY: { safeBlocks: 3, towers: 1 },
  MEDIUM: { safeBlocks: 2, towers: 1 },
  HARD: { safeBlocks: 1, towers: 1 },
  EXTREME: { safeBlocks: 1, towers: 2 },
  NIGHTMARE: { safeBlocks: 1, towers: 3 },
};

const stepsDictEasy: number[] = [
  1.26, 1.68, 2.25, 3.01, 4.01, 5.33, 7.11, 9.48, 12.67,
];
const stepsDictMedium: number[] = [
  1.42, 2.14, 3.2, 4.81, 7.21, 10.8, 16.22, 24.36, 36.5,
];
const stepsDictHard: number[] = [
  1.9, 3.8, 7.59, 15.19, 30.26, 60.69, 121.91, 242.37, 484.44,
];
const stepsDictExtreme: number[] = [2.85, 8.55, 25.63, 77.01, 229.3, 684.34];
const stepsDictNightmare: number[] = [
  3.8, 15.15, 60.51, 242.01, 970.52, 3840.21,
];
const SAFE = 1;
const TOWER = 2;

const difficultyStepsMap: Record<string, number[]> = {
  EASY: stepsDictEasy,
  MEDIUM: stepsDictMedium,
  HARD: stepsDictHard,
  EXTREME: stepsDictExtreme,
  NIGHTMARE: stepsDictNightmare,
};

/**
 * Checks the safety of the block the user has selected.
 *
 * @param {number} blockPosition - The position of the block in the active row.
 * @param {Array<Array<number>>} generatedMap - The map with safe places and towers.
 * @param {Array<Array<number>>} userMap - The map that tracks what the user has opened.
 * @param {number} activeRow - The current active row.
 * @returns {{ openHistoryMap: Array<Array<number>>, adjustedActiveRow: number }} - The updated userMap and the adjusted active row.
 */
export function checkBlockSafety(
  blockPosition: number,
  generatedMap: number[][],
  userMap: number[][],
  activeRow: number,
): { openHistoryMap: number[][]; adjustedActiveRow: number } {
  const SAFE = 1;
  const TOWER = 2;

  // Adjusting the row based on the fact that the first row in the game is the last row in the map
  const adjustedRow = generatedMap.length - activeRow;

  if (adjustedRow < 0 || adjustedRow >= generatedMap.length) {
    throw new Error('Invalid activeRow value');
  }

  const row = generatedMap[adjustedRow];
  if (row[blockPosition] === TOWER) {
    userMap[adjustedRow][blockPosition] = TOWER;
  } else {
    userMap[adjustedRow][blockPosition] = SAFE;
  }

  return {
    openHistoryMap: userMap,
    adjustedActiveRow: adjustedRow,
  };
}

export function generateOpenedMap(difficulty: string): number[][] {
  const safeBlocks = difficultyToSafeBlocks[difficulty].safeBlocks;

  const towers = difficultyToSafeBlocks[difficulty].towers;
  const stepsDict = difficultyStepsMap[difficulty];

  if (safeBlocks < 1 && safeBlocks > 3) {
    throw new Error('Invalid difficulty level');
  }
  const rows = stepsDict.length;
  const columns = safeBlocks + towers;
  const map: number[][] = Array(rows)
    .fill([])
    .map(() => Array(columns).fill(0));

  return map;
}

export function generateGameMap(difficulty: string): number[][] {
  const safeBlocks = difficultyToSafeBlocks[difficulty].safeBlocks;
  const towers = difficultyToSafeBlocks[difficulty].towers;
  const stepsDict = difficultyStepsMap[difficulty];

  if (safeBlocks < 1 && safeBlocks > 3) {
    throw new Error('Invalid difficulty level');
  }
  const rows = stepsDict.length;
  const columns = safeBlocks + towers;
  const map: number[][] = Array(rows)
    .fill([])
    .map(() => Array(columns).fill(SAFE));

  for (let i = 0; i < rows; i++) {
    let remainingTowers = towers;
    while (remainingTowers > 0) {
      const towerPosition = Math.floor(Math.random() * columns);
      if (map[i][towerPosition] === SAFE) {
        map[i][towerPosition] = TOWER;
        remainingTowers--;
      }
    }
  }
  return map;
}

export function validTile(tilePosition: number, difficulty: string): void {
  switch (difficulty.toLowerCase()) {
    case 'easy':
      if (tilePosition < 0 || tilePosition > 4) {
        throw new BadRequestException('Invalid tile');
      }
      break;
    case 'medium':
      if (tilePosition < 0 || tilePosition > 3) {
        throw new BadRequestException('Invalid tile');
      }
      break;
    case 'hard':
      if (tilePosition < 0 || tilePosition > 2) {
        throw new BadRequestException('Invalid tile');
      }
      break;
    case 'extreme':
      if (tilePosition < 0 || tilePosition > 3) {
        throw new BadRequestException('Invalid tile');
      }
      break;
    case 'nightmare':
      if (tilePosition < 0 || tilePosition > 4) {
        throw new BadRequestException('Invalid tile');
      }
      break;
    default:
      throw new BadRequestException('Invalid tile');
  }
}
