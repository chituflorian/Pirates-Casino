import { MoreThanOrEqual, Repository } from 'typeorm';
import { Mines } from './entities/mines.entity';
import { InjectRepository } from '@nestjs/typeorm';

export class MinesRepository extends Repository<Mines> {
  constructor(
    @InjectRepository(Mines)
    private readonly repository: Repository<Mines>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }
  public async findLatestByUserIdAndState(
    userId: number,
    state: string,
  ): Promise<Mines | undefined> {
    return (
      (await this.findOne({
        where: {
          user: { id: userId },
          state,
        },
        order: {
          createdAt: 'DESC',
        },
      })) || undefined
    );
  }
  async findLatestByUser(userId: number, limit: number): Promise<Mines[]> {
    return this.find({
      where: { user: { id: userId } },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  public async findLatest(limit: number): Promise<Mines[]> {
    return this.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  public async findLuckyWins(
    minMultiplier: number,
    limit: number,
  ): Promise<Mines[]> {
    return this.find({
      relations: ['user'],
      where: {
        multiplier: MoreThanOrEqual(minMultiplier),
        state: 'CASHED_OUT',
      },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  public async findMinesInProgress(userId: number): Promise<Mines | undefined> {
    return (
      (await this.findOneBy({ user: { id: userId }, state: 'IN_PROGRESS' })) ||
      undefined
    );
  }

  public async findLatestInProgressByUserIdWithoutGenerated(
    userId: number,
  ): Promise<Mines | undefined> {
    return (
      (await this.repository.findOne({
        where: {
          user: { id: userId },
          state: 'IN_PROGRESS',
        },
        order: { createdAt: 'DESC' },
        select: [
          'id',
          'gameId',
          'userMap',
          'profitSteps',
          'mines',
          'tilesOpened',
          'initialBet',
          'betAmount',
          'profit',
          'multiplier',
          'state',
          'createdAt',
          'updatedAt',
        ],
      })) || undefined
    );
  }
}
