import { Injectable, Logger } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { IBet } from './interfaces/ICrash';
import { BET_STATE, GAME_STATE } from './enums/state';
import { EntityManager } from 'typeorm';
import { PlatformConfigService } from '../config/platformconfig/platformconfig.service';
import { CrashBet } from './entities/crash-bet.entity';
import { v4 as uuidv4 } from 'uuid';
import { formatWithLamports } from '../utils/helper';
interface MaxWinRates {
  [betId: string]: number; // or use 'number' if your betId is a number
}
@Injectable()
export class CrashBets {
  private readonly logger = new Logger('Bets');
  public bets: IBet[] = [];
  public primaryGameId: number | null = null;
  public gameId: string | null = null;
  public gameState: GAME_STATE;
  public maxWinRates: MaxWinRates = {};
  public autoCashOuts = {};

  constructor(
    @InjectRepository(CrashBet)
    private readonly platformConfigService: PlatformConfigService,
    @InjectEntityManager() private readonly entityManager: EntityManager,
  ) {}

  public async add(
    userId: number,
    // wallet: string,
    name: string,
    amount: number,
    initialBet: number,
    multiplier: number | null,
    autoCashOut = 0,
    // currency: number,
    // profile: string,
  ): Promise<IBet | undefined> {
    if (!this.gameId) {
      return;
    }

    const betId = uuidv4();

    const createdBet = {
      betId: betId.toString(),
      userId,
      //   wallet,
      gameId: this.gameId,
      name,
      amount,
      initialBet,
      winAmount: 0,
      multiplier,
      autoCashOut,
      state: BET_STATE.ACTIVE,
      // currency,
      // profile,
    };

    this.bets.push(createdBet);

    this.logger.log('Pushed new bet', createdBet);

    const maxRate = Number(
      (
        Number(await this.platformConfigService.get('crash.MaxWin')) / amount
      ).toFixed(2),
    );

    this.maxWinRates[betId] = maxRate;

    // only auto cashout higher then 1 are valid
    if (autoCashOut > 1) this.autoCashOuts[betId] = autoCashOut;

    return createdBet;
  }
  public setGameId(id: string, primaryId: number) {
    this.gameId = id;
    this.primaryGameId = primaryId;
  }
  public setGameState(gameState: GAME_STATE) {
    this.gameState = gameState;
  }
  public getAll(): IBet[] {
    return this.bets;
  }
  public crash() {
    for (const bet of this.bets) {
      if (bet.state !== BET_STATE.ACTIVE) {
        continue;
      }

      bet.state = BET_STATE.CRASHED;
    }
  }
  public getBetSum(): number {
    return Object.values(this.bets).reduce(
      (t, { amount }) => t + Number(amount),
      0,
    );
  }
  public calculateWinAmount(): number {
    return Object.values(this.bets).reduce(
      (t, { winAmount }) => t + Number(winAmount),
      0,
    );
  }
  public findBetById(betId: string): IBet | undefined {
    return this.bets.find((bet) => bet.betId === betId);
  }

  public findBetByUserId(userId: number): IBet | undefined {
    return this.bets.find((bet) => bet.userId === userId);
  }
  public cashout(betId: string, multiplier: number): IBet {
    const bet = this.bets.find((bet) => bet.betId === betId);

    if (!bet) throw new Error('Bet not found');

    bet.state = BET_STATE.CASHOUT;
    bet.multiplier = multiplier;
    bet.winAmount = formatWithLamports(multiplier * bet.amount);

    return bet;
  }

  public checkExistBet(userId: number): boolean {
    let exists = false;
    for (const bet of this.bets) {
      if (bet.userId === userId) {
        exists = true;
        return exists;
      }
    }
    return exists;
  }
  public checkExistBetByWallet(id: number): boolean {
    let exists = false;
    for (const bet of this.bets) {
      if (bet.userId === id) {
        exists = true;
        return exists;
      }
    }
    return exists;
  }
  public async cache(isCreate: boolean) {
    return this.entityManager.transaction(
      async (transactionalEntityManager) => {
        try {
          const betPromises = this.bets.map((bet) => {
            if (isCreate) {
              const data = {
                gameId: this.primaryGameId,
                userId: bet.userId,
                betId: bet.betId,
                multiplier: bet.multiplier,
                amount: bet.amount,
                initialBet: bet.initialBet,
                winAmount: bet.winAmount,
                state: bet.state,
                // currencyId: bet.currency,
                autoCashOut: bet.autoCashOut,
              };
              return this.create(data, transactionalEntityManager);
            } else {
              const data: Partial<CrashBet> = {
                multiplier: bet.multiplier,
                amount: bet.amount,
                initialBet: bet.initialBet,
                winAmount: bet.winAmount,
                state: bet.state,
              };
              return this.updateByBetId(
                bet.betId,
                data,
                transactionalEntityManager,
              );
            }
          });

          // Await all the promises inside the transaction
          await Promise.all(betPromises);

          // Log the cached bets
          this.bets.forEach((bet) =>
            this.logger.log(`Cached "${bet.betId}" bet`),
          );
        } catch (error) {
          throw error;
        }
      },
    );
  }
  public clear() {
    this.bets = [];
    this.maxWinRates = {};
  }
  public async create(data, transactionalEntityManager: EntityManager) {
    const repository = transactionalEntityManager.getRepository(CrashBet);
    const newBet = repository.create(data);
    return repository.save(newBet);
  }
  public async updateByBetId(
    betId: string,
    data,
    transactionalEntityManager: EntityManager,
  ) {
    const repository = transactionalEntityManager.getRepository(CrashBet);
    return repository.update({ betId }, data);
  }
}
