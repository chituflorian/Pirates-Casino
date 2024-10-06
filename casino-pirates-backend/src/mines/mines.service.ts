import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { EntityManager, Repository } from 'typeorm';
import { PlatformConfigService } from '../config/platformconfig/platformconfig.service';
import { MinesRepository } from './mines.repository';
import { Mines } from './entities/mines.entity';
import { CreateMinesRespDTO } from './dto/CreateMinesRespDTO';
import { GamesHistoryService } from '../games-history/games-history.service';
import { GAME_TYPE } from '../games-history/entities/games-history.entity';
import IMines from './interface/IMines.interface';
import { BaseGameService } from '../utils/game-service';

@Injectable()
export class MinesService extends BaseGameService {
  constructor(
    platformConfigService: PlatformConfigService,
    private readonly minesRepository: MinesRepository,
    @InjectRepository(User)
    usersRepository: Repository<User>,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    private readonly gameHistoryService: GamesHistoryService,
  ) {
    super(platformConfigService, usersRepository, GAME_TYPE.MINES);
  }
  // Use an appropriate context name

  public stepsDict: number[] = [
    1.03, 1.07, 1.13, 1.18, 1.25, 1.31, 1.39, 1.48, 1.58, 1.69, 1.82, 1.97,
    2.15, 2.37, 2.64, 2.97, 3.39, 3.96, 4.75, 5.93, 7.91, 11.875, 23.75,
  ];

  public async create(
    id: number,
    mines: number,
    amount: number,
  ): Promise<CreateMinesRespDTO> {
    return this.entityManager.transaction(
      async (transactionalEntityManager) => {
        try {
          const user = await transactionalEntityManager.findOneByOrFail(User, {
            id,
          });

          await this.validateBetAmount(amount);

          await this.validateUserBalance(user, amount);

          const gameInProgress: Mines | null =
            await transactionalEntityManager.findOne(Mines, {
              where: {
                user: { id },
                state: 'IN_PROGRESS',
              },
              order: {
                createdAt: 'DESC',
              },
            });
          if (mines < 2 || mines > 24) {
            throw new BadRequestException('Invalid number of mines');
          }

          if (gameInProgress) {
            throw new BadRequestException(
              'You already have a game in progress',
            );
          }

          const gameId = uuidv4();

          const { generatedMap, profitSteps } =
            this.generateMapAndProfitSteps(mines);

          const userMap = [...Array(5).fill([0, 0, 0, 0, 0])];

          const game = await transactionalEntityManager.save(Mines, {
            gameId,
            generatedMap,
            userMap,
            profitSteps,
            mines,
            tilesOpened: 0,
            betAmount: amount,
            user,
            state: 'IN_PROGRESS',
          });

          await this.updateBalanceForNewGame(
            id,
            amount,
            transactionalEntityManager,
          );

          return {
            success: true,
            id: game.id,
            gameId: game.gameId,
            userMap: game.userMap,
            profitSteps: game.profitSteps,
          } as CreateMinesRespDTO;
        } catch (error) {
          throw error;
        }
      },
    );
  }

  private generateMapAndProfitSteps(mines: number): {
    generatedMap: number[][];
    profitSteps: number[];
  } {
    const initial = JSON.stringify([...Array(5).fill([0, 0, 0, 0, 0])]);
    const map = JSON.parse(initial) as number[][];
    for (let i = 0; i < mines; i++) {
      let x = Math.floor(Math.random() * 5);
      let y = Math.floor(Math.random() * 5);
      while (map[x][y] === 1) {
        x = Math.floor(Math.random() * 5);
        y = Math.floor(Math.random() * 5);
      }
      map[x][y] = 1;
    }
    const generatedMap = map;

    const steps: number[] = [];
    for (let i = mines - 2; i < this.stepsDict.length; i++) {
      steps.push(this.stepsDict[i]);
    }
    const profitSteps = steps;
    return { generatedMap, profitSteps };
  }

  public async cashout(id: number): Promise<any> {
    return this.entityManager.transaction(
      async (transactionalEntityManager) => {
        try {
          const user = await transactionalEntityManager.findOneBy(User, {
            id,
          });
          if (!user) {
            throw new UnauthorizedException('User not found');
          }

          const game = await transactionalEntityManager.findOne(Mines, {
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

          const multiplier = game.profitSteps[game.tilesOpened - 1];
          let profit = game.betAmount * multiplier;

          const maxWin = await Number(
            this.platformConfigService.get('mines.MaxWin'),
          );
          if (profit > maxWin) {
            profit = maxWin;
          }

          await transactionalEntityManager.update(
            Mines,
            { id: game.id },
            {
              state: 'CASHED_OUT',
              profit,
            },
          );

          await this.gameHistoryService.addGameToUserHistory(
            id,
            game.gameId,
            profit,
            GAME_TYPE.MINES,
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

          return {
            success: true,
            game,
          };
        } catch (error) {
          throw error;
        }
      },
    );
  }

  public async openTile(
    id: number,
    gameId: string,
    x: number,
    y: number,
  ): Promise<any> {
    return this.entityManager.transaction(
      async (transactionalEntityManager) => {
        try {
          if (x < 0 || x > 4 || y < 0 || y > 4) {
            throw new BadRequestException('Invalid tile');
          }

          const user = await transactionalEntityManager.findOneBy(User, {
            id,
          });
          if (!user) {
            throw new UnauthorizedException('User not found');
          }

          const game = await transactionalEntityManager.findOneBy(Mines, {
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
          const userMap = game.userMap;
          if (userMap[x][y] === 1) {
            throw new BadRequestException('Tile already opened');
          }

          userMap[x][y] = 1;
          const map = game.generatedMap;
          const tile = map[x][y];

          if (tile === 1) {
            await transactionalEntityManager.update(
              Mines,
              { id: game.id },

              {
                userMap,
                tilesOpened: 0,
                profit: 0,
                state: 'LOST',
              },
            );

            await this.gameHistoryService.addGameToUserHistory(
              id,
              game.gameId,
              0,
              GAME_TYPE.MINES,
              transactionalEntityManager,
            );

            return {
              success: true,
              gameOver: true,
              isMine: true,
              userMap,
              generatedMap: game.generatedMap,
              lastTile: false,
              profit: 0,
              multiplier: 0,
            };
          } else if (game.tilesOpened + 1 === 25 - game.mines) {
            const multiplier = game.profitSteps[game.tilesOpened];
            let profit = game.betAmount * multiplier;
            const maxWin = Number(
              await this.platformConfigService.get('mines.MaxWin'),
            );
            if (profit > maxWin) {
              profit = maxWin;
            }

            await transactionalEntityManager.update(
              Mines,
              { id: game.id },
              {
                userMap,
                tilesOpened: game.tilesOpened + 1,
                state: 'CASHED_OUT',
                profit,
              },
            );
            await this.gameHistoryService.addGameToUserHistory(
              id,
              game.gameId,
              profit,
              GAME_TYPE.MINES,
              transactionalEntityManager,
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
              isMine: false,
              userMap,
              generatedMap: game.generatedMap,
              lastTile: true,
              profit,
              multiplier,
            };
          } else {
            const multiplier = game.profitSteps[game.tilesOpened];
            const profit = game.betAmount * multiplier;
            await transactionalEntityManager.update(
              Mines,
              { id: game.id },
              {
                userMap,
                tilesOpened: game.tilesOpened + 1,
                state: 'IN_PROGRESS',
                profit,
              },
            );

            return {
              success: true,
              isMine: false,
              userMap,
              lastTile: false,
              profit,
              multiplier,
            };
          }
        } catch (error) {
          throw error;
        }
      },
    );
  }

  public async getGame(id: number): Promise<IMines> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return (
      (await this.minesRepository.findLatestInProgressByUserIdWithoutGenerated(
        user.id,
      )) ?? {}
    );
  }

  public getAllGames = async (): Promise<Mines[]> => {
    return await this.minesRepository.findLatest(15);
  };

  public getLuckyWins = async (): Promise<Mines[]> => {
    const luckyMultiplier = Number(
      this.platformConfigService.get('gems.LuckyMultiplier'),
    );
    return await this.minesRepository.findLuckyWins(
      luckyMultiplier as number,
      15,
    );
  };

  public getUserStats = async (userId: number): Promise<Mines[]> => {
    const user = await this.usersRepository.findOne({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    return await this.minesRepository.findLatestByUser(user.id, 15);
  };
}
