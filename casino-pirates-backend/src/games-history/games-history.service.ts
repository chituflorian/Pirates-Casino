import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { GAME_TYPE, GamesHistory } from './entities/games-history.entity';
import { IPaginationOptions } from '../utils/types/pagination-options';

@Injectable()
export class GamesHistoryService {
  private readonly logger = new Logger(GamesHistoryService.name);
  constructor(
    @InjectRepository(GamesHistory)
    private readonly gameHistoryRepository: Repository<GamesHistory>,
    @InjectEntityManager() private readonly entityManager: EntityManager,
  ) {}

  public async getGameHistoryByUserId(
    userId: number,
    paginationOptions: IPaginationOptions,
  ): Promise<GamesHistory[]> {
    return await this.gameHistoryRepository.find({
      where: { userId: userId },
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
    });
  }

  public async addGameToUserHistory(
    userId: number,
    gameId: string,
    profit: number,
    gameType: GAME_TYPE,
    transactionalEntityManager: EntityManager,
  ): Promise<void> {
    try {
      const repository = transactionalEntityManager.getRepository(GamesHistory);
      const gameHistory = repository.create({
        gameId,
        profit,
        game: gameType,
        userId,
      });

      await repository.save(gameHistory);

      // return savedGameHistory.id;
    } catch (error) {
      this.logger.error(
        `Failed to add game to user history for user with id ${userId}: ${error.message}`,
      );
      throw new InternalServerErrorException(error);
    }
  }
}
