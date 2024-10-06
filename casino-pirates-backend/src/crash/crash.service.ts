import { Injectable, Logger } from '@nestjs/common';
import { IBet, IChart, ICrashGame } from './interfaces/ICrash';
import { EntityManager, Repository } from 'typeorm';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { Crash } from './entities/crash.entity';
import { BET_STATE, GAME_STATE } from './enums/state';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';
import { WsException } from '@nestjs/websockets';
import { CrashBets } from './crash-bets.service';
import { User } from '../users/entities/user.entity';
import { EventsService } from './events.service';
import { Socket } from 'socket.io';
import { PlatformConfigService } from '../config/platformconfig/platformconfig.service';
import { formatWithLamports } from '../utils/helper';

export const INTERVAL_IN_MILLISECONDS = 100;
export const DELAY_BEFORE_START = 3000;
export const MAX_TIMER_VALUE = 10;

@Injectable()
export class CrashService {
  private readonly logger = new Logger('Crash');

  private interval;
  private timer;
  private timerValue = 10;
  private currentGame: ICrashGame;
  private chart: IChart;
  private primaryGameId: number | null = null;

  constructor(
    private eventsService: EventsService,
    private crashBets: CrashBets,
    private readonly platformConfigService: PlatformConfigService,
    @InjectRepository(Crash)
    private readonly crashRepository: Repository<Crash>,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}

  async sleep(ms = 1000) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  public async checkStackedCrashes() {
    const crashes = await this.getStacked();

    if (crashes.length > 0) {
      for (const crash of crashes) {
        await this.crashRepository.update(
          { gameId: crash.gameId },
          {
            state: GAME_STATE.CRASHED,
          },
        );
        this.logger.warn(
          `Game ID "${crash.gameId}" is stacked! Changed state to crashed`,
        );
      }
    }
  }

  public async initGame() {
    await this.checkStackedCrashes();

    this.chart = this.generateChart();
    this.currentGame = this.generateGame();

    const { id } = await this.crashRepository.save({
      gameId: this.currentGame.gameId,
      round_hash: this.currentGame.round_hash,
      round_number: this.currentGame.round_number,
      round_salt: this.currentGame.round_salt,
      round_random: this.currentGame.round_random,
      win_sum: 0,
      bet_sum: 0,
      state: GAME_STATE.PREPARE,
    });

    this.primaryGameId = id;

    this.crashBets.setGameId(this.currentGame.gameId, this.primaryGameId);

    this.eventsService.server.emit('crash:crypto', this.getCrypto());
    this.eventsService.server.emit('crash:bets', this.getBets());

    this.logger.log('Generated new game with id: ' + this.currentGame.gameId);

    this.prepareTimer();
  }

  private generateGame(): ICrashGame {
    const rand = Math.random();
    let coefficient = 0.001 + 0.999 / (1 - rand);
    if (Math.floor(coefficient * 100) % 15 === 0) {
      coefficient = 1;
    } else {
      coefficient = Math.round(coefficient * 100) / 100;
    }

    const round_salt = crypto
      .createHash('sha256')
      .update(Math.random().toString())
      .digest('hex');
    const round_hash = crypto
      .createHash('sha256')
      .update(`${coefficient}|${round_salt}`)
      .digest('hex');

    const gameId = uuidv4();

    return {
      gameId,
      round_hash,
      round_salt,
      round_random: rand,
      round_number: coefficient,
      state: GAME_STATE.PREPARE,
    };
  }

  private prepareTimer() {
    this.setState(GAME_STATE.PREPARE);

    this.timerValue = MAX_TIMER_VALUE;
    this.eventsService.server.emit('crash:timer', this.timerValue);

    this.timer = setInterval(() => {
      this.timerValue -= 1;

      this.eventsService.server.emit('crash:timer', this.timerValue);

      if (this.timerValue == 0) {
        clearInterval(this.timer);
        setTimeout(() => this.startGame(), 1000);
      }
    }, 1000);
  }

  private async startGame() {
    this.setState(GAME_STATE.ACTIVE);
    await this.updateGameState();
    await this.crashBets.cache(true);
    this.startGameInterval();
  }

  private generateChart(): IChart {
    return {
      x: 0,
      y: 0,
      pow: 2,
      value: 1,
    };
  }

  private async updateGameState() {
    await this.updateByGameId(this.currentGame.gameId, {
      state: GAME_STATE.ACTIVE,
    });
  }

  private startGameInterval() {
    this.interval = setInterval(async () => {
      this.eventsService.server.emit('crash:tick', this.chart.value);
      if (this.hasGameCrashed()) {
        await this.stopGame();
        return;
      }

      for (const [betId, maxWinRate] of Object.entries(
        this.crashBets.maxWinRates,
      )) {
        if (this.chart.value >= maxWinRate) {
          const bet = this.crashBets.findBetById(betId);
          if (bet && bet.state === BET_STATE.ACTIVE) {
            const socket = this.eventsService.getSocket(bet.userId);
            await this.cashout(socket, bet.userId, Number(maxWinRate));

            delete this.crashBets.maxWinRates[betId];
          } else {
            delete this.crashBets.maxWinRates[betId];
          }
        }
      }
      // here we should find all bets with auto cashout and cashout them
      for (const [betId, autoCashOut] of Object.entries(
        this.crashBets.autoCashOuts,
      )) {
        if (this.chart.value >= Number(autoCashOut) - 0.01) {
          const bet = this.crashBets.findBetById(betId);
          if (bet && bet.state === BET_STATE.ACTIVE) {
            const socket = this.eventsService.getSocket(bet.userId);
            await this.cashout(socket, bet.userId, 0, Number(autoCashOut));

            delete this.crashBets.autoCashOuts[betId];
          } else {
            delete this.crashBets.autoCashOuts[betId];
          }
        }
      }
      this.step();
    }, INTERVAL_IN_MILLISECONDS);
  }

  private hasGameCrashed(): boolean {
    return this.chart.value >= this.currentGame.round_number;
  }

  private setState(state: GAME_STATE) {
    this.currentGame.state = state;
    this.crashBets.setGameState(state);
    this.eventsService.server.emit('crash:state', this.currentGame.state);

    if (state === GAME_STATE.CRASHED) {
      this.eventsService.server.emit('crash:crypto', this.getCrypto());
    }
  }

  private async stopGame() {
    this.logger.log(`Crashed on ${this.chart.value}x`);

    clearInterval(this.interval);
    this.setState(GAME_STATE.CRASHED);

    this.crashBets.crash();

    this.eventsService.server.emit('crash:bets', this.getBets());

    await this.crashBets.cache(false);

    setTimeout(async () => {
      await this.updateByGameId(this.currentGame.gameId, {
        bet_sum: this.crashBets.getBetSum(),
        win_sum: this.crashBets.calculateWinAmount(),
        state: GAME_STATE.CRASHED,
      });

      this.eventsService.server.emit('crash:new-history', {
        gameId: this.currentGame.gameId,
        round_hash: this.currentGame.round_hash,
        round_number: this.currentGame.round_number,
        round_salt: this.currentGame.round_salt,
        round_random: this.currentGame.round_random,
      });

      this.crashBets.clear();

      await this.initGame();
    }, DELAY_BEFORE_START);
  }

  public async cashout(
    client: Socket,
    id: number,
    rate?: number,
    autocashout?: number,
  ) {
    return this.entityManager.transaction(
      async (transactionalEntityManager) => {
        try {
          const user = await transactionalEntityManager.findOneBy(User, { id });

          if (!user) {
            throw new WsException(`Unauthorized`);
          }

          if (this.currentGame.state !== GAME_STATE.ACTIVE) {
            throw new WsException(`This round is already crashed`);
          }

          const userBet = this.crashBets.findBetByUserId(user.id);

          if (!userBet) {
            throw new WsException(`Found no bet in this round`);
          }

          if (userBet.state !== BET_STATE.ACTIVE) {
            throw new WsException(`Your bet status is not playing`);
          }

          const cashoutedBet = this.crashBets.cashout(
            userBet.betId,
            rate ? rate : this.chart.value,
          );

          await transactionalEntityManager.increment(
            User,
            { id },
            'balance',
            cashoutedBet.winAmount,
          );

          const balance: number = user.balance;

          this.eventsService.server.emit('crash:cashout-bet', cashoutedBet);

          if (client) {
            client.emit('noty', {
              type: 'info',
              text: `You cashed out ${formatWithLamports(
                cashoutedBet.winAmount,
              )} `,
            });

            if (rate) {
              client.emit('noty', {
                type: 'info',
                text: `You got the maximum win! Bet automatically cashed out`,
              });
            }
            if (autocashout) {
              client.emit('noty', {
                type: 'info',
                text: `You reached your autocashout ${autocashout} Bet automatically cashed out`,
              });
            }
          }
          if (client) {
            client.emit('balance', +balance);
          }
        } catch (e) {
          if (e instanceof WsException) {
            if (client) {
              client.emit('noty', {
                type: 'error',
                text: e.message,
              });
            }
          } else {
            if (client) {
              client.emit('noty', {
                type: 'error',
                text: 'Server error',
              });
            }
          }
          throw e;
        }
      },
    );
  }
  public async getStacked() {
    return this.crashRepository.find({
      where: [{ state: GAME_STATE.PREPARE }, { state: GAME_STATE.ACTIVE }],
    });
  }

  public async makeBet(
    client: Socket,
    id: number,
    amount: number,
    autoCashOut = 0,
  ) {
    if (!(await Boolean(this.platformConfigService.get('crash.allowBets')))) {
      throw new WsException('Bets temporarily unavailable');
    }
    // try to prevent duplicate bets
    try {
      if (this.crashBets.checkExistBetByWallet(id)) {
        throw new WsException(`You already joined in this round`);
      }
    } catch (e) {
      console.log('Error in makebet', e);
    }

    return this.entityManager.transaction(
      async (transactionalEntityManager) => {
        try {
          const user = await transactionalEntityManager.findOneBy(User, { id });

          if (!user) {
            throw new WsException(`Unauthorized`);
          }
          // if (userWallet.currencyId != currency) {
          //   throw new WsException(`Unauthorized`);
          // }

          if (+user.balance < amount) {
            throw new WsException(`Not enough balance`);
          }

          if (this.crashBets.checkExistBet(user.id)) {
            throw new WsException(`You already joined in this round`);
          }

          if (this.currentGame.state !== GAME_STATE.PREPARE) {
            throw new WsException(`This round is not accept bets`);
          }

          await transactionalEntityManager.decrement(
            User,
            { id },
            'balance',
            amount,
          );

          await transactionalEntityManager.increment(
            User,
            { id },
            'balance',
            amount,
          );

          await transactionalEntityManager.increment(
            User,
            { id },
            'experience',
            amount,
          );

          const createdBet = this.crashBets.add(
            user.id,
            user.username as string,
            // wallet,
            amount,
            amount,
            null,
            autoCashOut,
            // user.profile,
          );
          this.eventsService.server.emit('crash:new-bet', createdBet);

          const balance: number = user.balance;
          client.emit('noty', { type: 'info', text: `You placed ${amount}` });
          client.emit('balance', +balance);
        } catch (e) {
          if (e instanceof WsException) {
            client.emit('noty', {
              type: 'error',
              text: e.message,
            });
          } else {
            client.emit('noty', {
              type: 'error',
              text: 'Server error',
            });
          }
          throw e;
        }
      },
    );
  }

  public getBets(): IBet[] {
    return this.crashBets.getAll();
  }

  public getState(): GAME_STATE {
    return this.currentGame.state;
  }

  public getHistory() {
    return this.crashRepository.find({
      select: [
        'gameId',
        'round_hash',
        'round_number',
        'round_salt',
        'round_random',
      ],
      where: {
        state: GAME_STATE.CRASHED,
      },
      order: {
        id: 'DESC',
      },
      take: 25,
    });
  }

  public getCurrentGame(): ICrashGame {
    return this.currentGame;
  }

  public getValue(): number | null {
    if (this.currentGame.state === GAME_STATE.PREPARE) {
      return null;
    } else {
      return this.chart.value;
    }
  }

  public getCrypto() {
    switch (this.currentGame.state) {
      case GAME_STATE.ACTIVE:
        return {
          round_hash: this.currentGame.round_hash,
        };
      case GAME_STATE.CRASHED:
        return {
          round_hash: this.currentGame.round_hash,
          round_salt: this.currentGame.round_salt,
          round_random: this.currentGame.round_random,
        };
      case GAME_STATE.PREPARE:
        return {
          round_hash: this.currentGame.round_hash,
        };

      default:
        return {
          round_hash: this.currentGame.round_hash,
        };
    }
  }

  private step() {
    this.chart.y = Math.pow(this.chart.x, this.chart.pow) / 50;
    this.chart.value += this.chart.y >= 0.01 ? this.chart.y : 0.01;

    if (this.chart.value >= this.currentGame.round_number) {
      this.chart.value = this.currentGame.round_number;
    }

    this.chart.x += 0.005;
  }
  public async updateByGameId(
    gameId: string,
    data: Partial<Crash>,
  ): Promise<void> {
    await this.crashRepository.update({ gameId }, data);
  }
}
