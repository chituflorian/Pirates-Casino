import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  GamesHistory,
  GAME_TYPE,
} from '../../../../games-history/entities/games-history.entity';
import { User } from '../../../../users/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable({})
export class GameHistorySeedService {
  constructor(
    @InjectRepository(GamesHistory)
    private readonly gameHistoryRepository: Repository<GamesHistory>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async run() {
    const countGameHistory = await this.gameHistoryRepository.count();

    if (countGameHistory === 0) {
      const existingUsers = await this.userRepository.find();

      const gameHistoriesToSeed: Partial<GamesHistory>[] = [];

      for (let i = 1; i <= 2; i++) {
        const randomUser =
          existingUsers[Math.floor(Math.random() * existingUsers.length)];
        const randomGameType = this.getRandomGameType();

        gameHistoriesToSeed.push({
          profit: i * 500,
          user: randomUser,
          game: randomGameType,
        });
      }

      await this.gameHistoryRepository.save(gameHistoriesToSeed);
    }
  }

  private getRandomGameType(): GAME_TYPE {
    const gameTypes = Object.values(GAME_TYPE) as GAME_TYPE[];
    return gameTypes[Math.floor(Math.random() * gameTypes.length)];
  }
}
