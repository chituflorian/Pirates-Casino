import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Mines } from '../../../../mines/entities/mines.entity';
import { User } from '../../../../users/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MinesSeedService {
  constructor(
    @InjectRepository(Mines)
    private readonly minesRepository: Repository<Mines>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async run() {
    const countMines = await this.minesRepository.count();
    if (countMines === 0) {
      const existingUsers = await this.userRepository.find();
      const randomUser =
        existingUsers[Math.floor(Math.random() * existingUsers.length)];

      const minesToSeed: Partial<Mines>[] = [
        {
          gameId: 'f2b236e0-25d4-4674-aa35-a7cf6f87eb57',
          generatedMap: [
            [0, 0, 0, 1, 0],
            [0, 0, 0, 0, 0],
            [1, 1, 0, 0, 0],
            [0, 0, 1, 0, 1],
            [0, 0, 0, 0, 0],
          ],
          userMap: [
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 1],
            [0, 0, 0, 0, 0],
          ],
          profitSteps: [
            1.18, 1.24, 1.3, 1.37, 1.46, 1.56, 1.69, 1.78, 1.93, 2.11, 2.26,
            2.64, 2.97, 3.39, 3.96, 4.75, 5.93, 7.91, 11.875, 23.75,
          ],
          mines: 5,
          tilesOpened: 0,
          initialBet: 1.0,
          betAmount: 0.96,
          profit: 0.0,
          multiplier: 0.0,
          state: 'LOST',
          user: randomUser,
        },
      ];
      await this.minesRepository.save(minesToSeed);
    }
  }
}
