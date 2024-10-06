import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { TowerModule } from '../../src/tower/tower.module';
import { APP_URL, PRIVATE_KEYS } from '../utils/constants';
import request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Tower } from '../../src/tower/entities/tower.entity';
import { Repository } from 'typeorm';
import { PlatformConfigService } from '../../src/config/platformconfig/platformconfig.service';
import { CreateTowerReqDTO } from '../../src/tower/dto/CreateTowerReqDTO';
import { OpenTileReqDTO } from '../../src/tower/dto/OpenTileReqDTO';
import { User } from '../../src/users/entities/user.entity';
import { ethers } from 'ethers';

describe('TowerController (e2e)', () => {
  let token: string;
  let userId: number;
  let app: INestApplication;
  let platformConfigService: PlatformConfigService;
  let towerRepository: Repository<Tower>;
  let userRepository: Repository<User>;
  let towerInProgress: Tower | null;
  let maxAmount: number;
  let minAmount: number;
  let status: number;
  let maxWin: number;

  let userAfterGameCreation: User;
  let userBeforeGameCreation: User;
  let initialBalance: number;
  let finalBalance: number;
  let gameData;
  const stepsDictEasy: number[] = [
    1.26, 1.68, 2.25, 3.01, 4.01, 5.33, 7.11, 9.48, 12.67,
  ];

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule, TowerModule],
      providers: [],
    }).compile();
    app = module.createNestApplication();
    await app.init();

    const wallet = new ethers.Wallet(PRIVATE_KEYS[0].privateKey);
    const message = await getMessageToSign(wallet.address);
    const signature = await wallet.signMessage(message);

    const loginResponse = await request(APP_URL)
      .post('/api/auth/login-or-register')
      .send({
        address: wallet.address,
        signature: signature,
        chainTypeId: 1,
      })
      .expect(200);

    console.log(loginResponse.body.data.token);
    token = loginResponse.body.data.token;
    userId = loginResponse.body.data.user.id;

    towerRepository = module.get<Repository<Tower>>(getRepositoryToken(Tower));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    platformConfigService = module.get<PlatformConfigService>(
      PlatformConfigService,
    );

    maxAmount = Number(await platformConfigService.get('tower.MaxAmount'));
    minAmount = Number(await platformConfigService.get('tower.MinAmount'));
    maxWin = Number(await platformConfigService.get('tower.MaxWin'));
    status = Number(await platformConfigService.get('tower.Status'));

    // const allGamesInProgress: Tower[] = await towerRepository.find({
    //   where: {
    //     user: { id: userId },
    //     state: 'IN_PROGRESS',
    //   },
    //   order: { createdAt: 'DESC' },
    // });
    // for (const game of allGamesInProgress) {
    //   await towerRepository.delete(game.id);
    // }
  });

  afterAll(async () => {
    const response = await request(APP_URL)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(204); // OK
    await app.close();
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });
  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('platform config service', () => {
    it('should be defined', () => {
      expect(platformConfigService).toBeDefined();
    });
    it('should have correct settings for tower game', () => {
      expect(maxWin).toBe(500);
      expect(maxAmount).toBe(50);
      expect(minAmount).toBe(1);
      expect(status).toBe(1);
    });
  });

  describe('DTO types ensured', () => {
    it('should create a game and return a DTO with correct structure and types', async () => {
      const payload: CreateTowerReqDTO = {
        betAmount: 4,
        difficulty: 'EASY',
      };
      const response = await request(APP_URL)
        .post('/api/tower/create')
        .set('Authorization', `Bearer ${token}`)
        .send(payload);

      // Check the status of the response
      expect(response.status).toBe(201);
      expect(response.body).toBeDefined();
      expect(response.body.status).toBe(true);
      expect(response.body.data).toBeDefined();
      // Check the types of the fields in the response body
      gameData = response.body.data;

      const { success, gameId, userMap, profitSteps, difficulty, state } =
        gameData;

      expect(typeof success).toBe('boolean');
      expect(success).toBe(true);
      expect(typeof gameId).toBe('string');
      expect(Array.isArray(userMap)).toBe(true);
      expect(Array.isArray(profitSteps)).toBe(true);
      expect(typeof difficulty).toBe('string');
      expect(typeof state).toBe('string');

      //!important
      expect(response.body.data.generatedMap).toBeUndefined();

      expect(difficulty).toBe('EASY');
      expect(userMap.length).toBe(9);
      expect(userMap).toEqual([
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ]);
      expect(profitSteps).toEqual(stepsDictEasy);
      expect(state).toBe('IN_PROGRESS');

      await simulateWinGame(userId, token);
    });

    it('should open a tile and return a DTO with correct structure and types', async () => {
      expect(towerInProgress).toBeUndefined();

      await request(APP_URL)
        .post('/api/tower/create')
        .set('Authorization', `Bearer ${token}`)
        .send({ betAmount: 4, difficulty: 'EASY' })
        .expect(201)
        .expect(({ body }) => {
          expect(body).toBeDefined();
          expect(body.status).toBe(true);
        });
      const {
        response,
        multiplier,
        blockPosition,
        activeRow,
        profit,
        userMap,
      } = await simulateOpenSafeTile(userId, token);

      expect(response).toEqual({
        message: 'ok',
        data: {
          success: true,
          gameOver: false,
          blockPosition: blockPosition,
          isTower: false,
          userMap: userMap,
          state: 'IN_PROGRESS',
          activeRow: activeRow,
          profit: profit,
          multiplier: multiplier,
        },
        status: true,
      });

      const gameData = Object(response).data;

      expect(gameData).toEqual({
        success: expect.any(Boolean),
        gameOver: expect.any(Boolean),
        blockPosition: expect.any(Number),
        isTower: expect.any(Boolean),
        userMap: expect.any(Array),
        state: expect.any(String),
        activeRow: expect.any(Number),
        profit: expect.any(Number),
        multiplier: expect.any(Number),
      });
      await request(APP_URL)
        .post('/api/tower/cashout')
        .set('Authorization', `Bearer ${token}`);

      expect(towerInProgress).toBeUndefined();
    });

    it('should open an unsafe tile and return a DTO with correct structure and types', async () => {
      expect(towerInProgress).toBeUndefined();

      await request(APP_URL)
        .post('/api/tower/create')
        .set('Authorization', `Bearer ${token}`)
        .send({ betAmount: 4, difficulty: 'EASY' })
        .expect(201)
        .expect(({ body }) => {
          expect(body).toBeDefined();
          expect(body.status).toBe(true);
        });
      const { response, blockPosition, generatedMap, userMap } =
        await simulateOpenUnsafeTile(userId, token);

      expect(response).toEqual({
        message: 'ok',
        data: {
          success: true,
          gameOver: true,
          blockPosition: blockPosition,
          isTower: true,
          userMap: userMap,
          generatedMap: generatedMap,
          state: 'LOST',
          activeRow: null,
          profit: 0,
          multiplier: 0,
        },
        status: true,
      });

      const gameData = Object(response).data;

      expect(gameData).toEqual({
        success: expect.any(Boolean),
        gameOver: expect.any(Boolean),
        blockPosition: expect.any(Number),
        isTower: expect.any(Boolean),
        userMap: expect.any(Array),
        generatedMap: expect.any(Array),
        state: expect.any(String),
        activeRow: null,
        profit: expect.any(Number),
        multiplier: expect.any(Number),
      });

      await request(APP_URL)
        .post('/api/tower/cashout')
        .set('Authorization', `Bearer ${token}`);

      expect(towerInProgress).toBeUndefined();
    });

    it('should open the last safe tile and return a DTO with correct structure and types', async () => {
      expect(towerInProgress).toBeUndefined();
      await request(APP_URL)
        .post('/api/tower/create')
        .set('Authorization', `Bearer ${token}`)
        .send({ betAmount: 4, difficulty: 'EASY' })
        .expect(201)
        .expect(({ body }) => {
          expect(body).toBeDefined();
          expect(body.status).toBe(true);
        });

      const { response, multiplier, generatedMap, userMap } =
        await simulateOpenLastSafeTile(userId, token);

      if (response) {
        expect(response).toEqual({
          message: 'ok',
          data: {
            success: true,
            gameOver: true,
            blockPosition: 0,
            isTower: false,
            userMap: userMap,
            generatedMap: generatedMap,
            state: 'CASHED_OUT',
            activeRow: 0,
            profit: maxWin,
            multiplier: multiplier,
          },
          status: true,
        });

        const gameData = Object(response).data;

        expect(gameData).toEqual({
          success: expect.any(Boolean),
          gameOver: expect.any(Boolean),
          blockPosition: expect.any(Number),
          isTower: expect.any(Boolean),
          userMap: expect.any(Array),
          generatedMap: expect.any(Array),
          state: expect.any(String),
          activeRow: expect.any(Number),
          profit: expect.any(Number),
          multiplier: expect.any(Number),
        });
        await request(APP_URL)
          .post('/api/tower/cashout')
          .set('Authorization', `Bearer ${token}`);
        expect(towerInProgress).toBeUndefined();
      } else {
        await towerRepository.delete({ state: 'IN_PROGRESS' });
      }
    });
  });

  describe('Balance rules', () => {
    it('should subtract the correct balance when a new game is created', async () => {
      userBeforeGameCreation = (await userRepository.findOne({
        where: {
          id: userId,
        },
      })) as User;

      expect(userBeforeGameCreation).toBeDefined();
      // Get the initial balance
      initialBalance = userBeforeGameCreation
        ? userBeforeGameCreation.balance
        : 0;
      // Create a new game
      await request(APP_URL)
        .post('/api/tower/create')
        .set('Authorization', `Bearer ${token}`)
        .send({ betAmount: maxAmount, difficulty: 'EASY' });

      userAfterGameCreation = (await userRepository.findOne({
        where: {
          id: userId,
        },
        cache: false,
      })) as User;

      finalBalance = userAfterGameCreation ? userAfterGameCreation.balance : 0;
      expect(Number(finalBalance)).toEqual(
        Number(Number(initialBalance) - Number(maxAmount)),
      );
      await simulateWinGame(userId, token);
    });
    it('should add the correct balance when a game is won', async () => {
      await request(APP_URL)
        .post('/api/tower/create')
        .set('Authorization', `Bearer ${token}`)
        .send({ betAmount: maxAmount, difficulty: 'EASY' });

      // Get the initial balance
      userBeforeGameCreation = (await userRepository.findOne({
        where: {
          id: userId,
        },
      })) as User;

      expect(userBeforeGameCreation).toBeDefined();

      initialBalance = userBeforeGameCreation
        ? userBeforeGameCreation.balance
        : 0;
      // Simulate a game win
      await simulateWinGame(userId, token);
      // Get the final balance
      userAfterGameCreation = (await userRepository.findOne({
        where: {
          id: userId,
        },
        cache: false,
      })) as User;

      finalBalance = userAfterGameCreation ? userAfterGameCreation.balance : 0;

      // Check if the correct balance was added
      expect(Number(finalBalance)).toEqual(
        Number(Number(initialBalance) + Number(maxAmount * stepsDictEasy[0])),
      );
    });
    it('should add the correct balance when a game is lost', async () => {
      // Get the initial balance
      userBeforeGameCreation = (await userRepository.findOne({
        where: {
          id: userId,
        },
      })) as User;

      expect(userBeforeGameCreation).toBeDefined();

      initialBalance = userBeforeGameCreation
        ? userBeforeGameCreation.balance
        : 0;

      await request(APP_URL)
        .post('/api/tower/create')
        .set('Authorization', `Bearer ${token}`)
        .send({ betAmount: maxAmount, difficulty: 'EASY' });
      // Simulate a game loss
      await simulateLoseGame(userId, token);

      // Get the final balance
      userAfterGameCreation = (await userRepository.findOne({
        where: {
          id: userId,
        },
        cache: false,
      })) as User;

      finalBalance = userAfterGameCreation ? userAfterGameCreation.balance : 0;

      // Check if the correct balance was added
      expect(Number(finalBalance)).toEqual(Number(initialBalance - maxAmount));
    });
    it('should not allow creating a game if there is not enough balance', async () => {
      const payload: CreateTowerReqDTO = {
        betAmount: maxAmount,
        difficulty: 'EASY',
      };

      const userBeforeGameCreation: User = (await userRepository.findOne({
        where: {
          id: userId,
        },
      })) as User;
      expect(userBeforeGameCreation).toBeDefined();

      const response = await request(APP_URL)
        .post('/api/tower/create')
        .set('Authorization', `Bearer ${token}`)
        .send(payload);

      if (userBeforeGameCreation.balance < payload.betAmount) {
        expect(response.status).toBe(201);
        expect(response.body.status).toBe(false);
        expect(response.body.message).toBe('Insufficient balance');
        expect(response.body.data).toBe(null);
      }
      await simulateLoseGame(userId, token);
    });
    it('should not increment balance more than the maximum win', async () => {
      await request(APP_URL)
        .post('/api/tower/create')
        .set('Authorization', `Bearer ${token}`)
        .send({ betAmount: maxAmount, difficulty: 'EASY' });

      // Get the initial balance
      userBeforeGameCreation = (await userRepository.findOne({
        where: {
          id: userId,
        },
      })) as User;

      expect(userBeforeGameCreation).toBeDefined();

      initialBalance = userBeforeGameCreation
        ? userBeforeGameCreation.balance
        : 0;
      // Simulate a game win
      await simulateWinGame(userId, token);
      // Get the final balance
      userAfterGameCreation = (await userRepository.findOne({
        where: {
          id: userId,
        },
        cache: false,
      })) as User;

      finalBalance = userAfterGameCreation ? userAfterGameCreation.balance : 0;

      expect(finalBalance - initialBalance).toBeLessThanOrEqual(maxWin);
    });
    it('should not allow creating a game if the bet amount is greater than the maximum bet', async () => {
      const payload: CreateTowerReqDTO = {
        betAmount: maxAmount + 1,
        difficulty: 'EASY',
      };

      const response = await request(APP_URL)
        .post('/api/tower/create')
        .set('Authorization', `Bearer ${token}`)
        .send(payload);

      expect(response.status).toBe(201);
      expect(response.body.status).toBe(false);
      expect(response.body.message).toBe('Maximum bet exceeded');
      expect(response.body.data).toBe(null);

      await simulateLoseGame(userId, token);
    });
    it('should not allow creating a game if the bet amount is less than the minimum bet', async () => {
      const payload: CreateTowerReqDTO = {
        betAmount: minAmount - 1,
        difficulty: 'EASY',
      };

      const response = await request(APP_URL)
        .post('/api/tower/create')
        .set('Authorization', `Bearer ${token}`)
        .send(payload);

      expect(response.status).toBe(201);
      expect(response.body.status).toBe(false);
      expect(response.body.data).toBe(null);

      await simulateLoseGame(userId, token);
    });
  });

  describe('Game safety: ', () => {
    it('should not create a game if a game is already in progress', async () => {
      const payload: CreateTowerReqDTO = {
        betAmount: maxAmount,
        difficulty: 'EASY',
      };

      await request(APP_URL)
        .post('/api/tower/create')
        .set('Authorization', `Bearer ${token}`)
        .send(payload);

      const towerGame = await towerRepository.findOne({
        where: {
          user: { id: userId },
          state: 'IN_PROGRESS',
        },
        order: { createdAt: 'DESC' },
      });

      expect(towerGame).toBeDefined();

      if (towerGame) {
        const response = await request(APP_URL)
          .post('/api/tower/create')
          .set('Authorization', `Bearer ${token}`)
          .send(payload);

        expect(response.status).toBe(201);
        expect(response.body).toEqual({
          message: 'You already have a game in progress',
          data: null,
          status: false,
        });
      }

      await towerRepository.delete({ state: 'IN_PROGRESS' });
    });
    it('should not create a game if the difficulty input is not EASY MEDIUM HARD EXTREME NIGHTMARE', async () => {
      const payload = {
        betAmount: maxAmount,
        difficulty: 'nightmare',
      };

      await request(APP_URL)
        .post('/api/tower/create')
        .set('Authorization', `Bearer ${token}`)
        .send(payload)
        .expect(201)
        .expect(({ body }) => {
          expect(body).toBeDefined();
          expect(body).toEqual({
            status: false,
            data: null,
            message:
              'Invalid difficulty level, please enter a valid one, ex: EASY MEDIUM HARD EXTREME NIGHTMARE',
          });
        });
    });
    it('should not create a game if betAmount is not smaller then max betAmount and it should be a number', async () => {
      const payload = {
        betAmount: 999,
        difficulty: 'EASY',
      };
      await request(APP_URL)
        .post('/api/tower/create')
        .set('Authorization', `Bearer ${token}`)
        .send(payload)
        .expect(201)
        .expect(({ body }) => {
          expect(body).toBeDefined();
          expect(body).toEqual({
            data: null,
            message: 'Maximum bet exceeded',
            status: false,
          });
        });
    });
    it('should not create a game if betAmount is not greater then min betAmount and it should be a number', async () => {
      const payload = {
        betAmount: 0.1,
        difficulty: 'EXTREME',
      };
      await request(APP_URL)
        .post('/api/tower/create')
        .set('Authorization', `Bearer ${token}`)
        .send(payload)
        .expect(201)
        .expect(({ body }) => {
          expect(body).toBeDefined();
          expect(body).toEqual({
            data: null,
            message: 'Minimum bet not reached',
            status: false,
          });
        });
    });
    it('should not create a game if betAmount is negative', async () => {
      const payload = {
        betAmount: -0.1,
        difficulty: 'EXTREME',
      };
      await request(APP_URL)
        .post('/api/tower/create')
        .set('Authorization', `Bearer ${token}`)
        .send(payload)
        .expect(201)
        .expect(({ body }) => {
          expect(body).toBeDefined();
          expect(body).toEqual({
            status: false,
            data: null,
            message: 'betAmount must be a positive number',
          });
        });
    });
    it('should not create a game if betAmount is string', async () => {
      const payload = {
        betAmount: 'string',
        difficulty: 'EXTREME',
      };
      await request(APP_URL)
        .post('/api/tower/create')
        .set('Authorization', `Bearer ${token}`)
        .send(payload)
        .expect(201)
        .expect(({ body }) => {
          expect(body).toBeDefined();
          expect(body).toEqual({
            status: false,
            data: null,
            message:
              'betAmount must be a positive number, betAmount must be a number conforming to the specified constraints',
          });
        });
    });
    it('should not create a game if difficulty is non string', async () => {
      const payload = {
        betAmount: 20,
        difficulty: 23,
      };
      await request(APP_URL)
        .post('/api/tower/create')
        .set('Authorization', `Bearer ${token}`)
        .send(payload)
        .expect(201)
        .expect(({ body }) => {
          expect(body).toBeDefined();
          expect(body).toEqual({
            status: false,
            data: null,
            message:
              'Invalid difficulty level, please enter a valid one, ex: EASY MEDIUM HARD EXTREME NIGHTMARE, difficulty must be a string',
          });
        });
    });
    it('should not create a game if difficulty has extra white spaces', async () => {
      const payload = {
        betAmount: 50,
        difficulty: ' EASY ',
      };

      await request(APP_URL)
        .post('/api/tower/create')
        .set('Authorization', `Bearer ${token}`)
        .send(payload)
        .expect(201)
        .expect(({ body }) => {
          expect(body).toBeDefined();
          expect(body).toEqual({
            status: false,
            data: null,
            message:
              'Invalid difficulty level, please enter a valid one, ex: EASY MEDIUM HARD EXTREME NIGHTMARE',
          });
        });
    });
    it('should not create a game if payload is missing', async () => {
      const payload = {};

      await request(APP_URL)
        .post('/api/tower/create')
        .set('Authorization', `Bearer ${token}`)
        .send(payload)
        .expect(201)
        .expect(({ body }) => {
          expect(body).toEqual({
            status: false,
            data: null,
            message:
              'betAmount should not be empty, betAmount must be a positive number, betAmount must be a number conforming to the specified constraints',
          });
        });
    });
    it('should not open a tile if the gameId is incorrect', async () => {
      const payload: OpenTileReqDTO = {
        gameId: '56f2f0ee-7b37-4a98-9d4d-8d883bac7bae',
        tilePosition: 2,
      };
      await request(APP_URL)
        .post('/api/tower/openTile')
        .set('Authorization', `Bearer ${token}`)
        .send(payload)
        .expect(201)
        .expect(({ body }) => {
          expect(body).toEqual({
            data: null,
            message: 'Game not found',
            status: false,
          });
        });
    });
    it('should not open a tile if the gameId is incorrect format', async () => {
      const payload = {
        gameId: Number('56f2f0ee-7b37-4a98-9d4d-8d883bac7bae'),
        tilePosition: 2,
      };
      await request(APP_URL)
        .post('/api/tower/openTile')
        .set('Authorization', `Bearer ${token}`)
        .send(payload)
        .expect(201)
        .expect(({ body }) => {
          expect(body).toEqual({
            status: false,
            message: 'gameId must be a UUID, gameId should not be empty',
            data: null,
          });
        });
    });
    it('should not open a tile if the tile position is not in the matrix', async () => {
      if (!towerInProgress) return;
      const payload = {
        gameId: towerInProgress.gameId,
        tilePosition: -1,
      };
      await request(APP_URL)
        .post('/api/tower/openTile')
        .set('Authorization', `Bearer ${token}`)
        .send(payload)
        .expect(201)
        .expect(({ body }) => {
          expect(body).toEqual({
            data: null,
            message: 'tilePosition must not be less than 0',
            status: false,
          });
        });
    });
    it('should not open a tile if payload is missing', async () => {
      const payload = {};

      await request(APP_URL)
        .post('/api/tower/openTile')
        .set('Authorization', `Bearer ${token}`)
        .send(payload)
        .expect(201)
        .expect(({ body }) => {
          expect(body).toEqual({
            data: null,
            message: 'gameId must be a UUID, gameId should not be empty',
            status: false,
          });
        });
    });
    it('should not allow opening a tile for a not in progress game id => 400 game not found', async () => {
      const payload: OpenTileReqDTO = {
        gameId: '56f2f0ee-7b37-4a98-9d4d-8d883bac7bae',
        tilePosition: 2,
      };
      if (towerInProgress) {
        await request(APP_URL)
          .post('/api/tower/openTile')
          .set('Authorization', `Bearer ${token}`)
          .send(payload)
          .expect(200)
          .expect(({ body }) => {
            expect(body).toBeDefined();
            expect(body).toEqual({
              message: 'Game not found',
              data: null,
              status: false,
            });
          });
      }
    });

    // Test case to check if the game doesn't allow creating a new game with the same gameId
    it.skip('should not allow creating a new game with the same gameId', async () => {
      // Add your test implementation here
    });

    // Test case to check if the game doesn't allow cashing out if no tiles were opened
    it.skip('should not allow cashing out if no tiles were opened', async () => {
      // Add your test implementation here
    });

    // Test case to check if the game doesn't allow opening a tile that's already opened
    it.skip('should not allow opening a tile that is already opened', async () => {
      // Add your test implementation here
    });

    // Test case to check if the game doesn't allow opening a tile after the game is lost
    it.skip('should not allow opening a tile after the game is lost', async () => {
      // Add your test implementation here
    });

    // Test case to check if the game doesn't allow cashing out after the game is lost
    it.skip('should not allow cashing out after the game is lost', async () => {
      // Add your test implementation here
    });

    // Test case to check if the game doesn't allow opening a tile after cashing out
    it.skip('should not allow opening a tile after cashing out', async () => {
      // Add your test implementation here
    });
  });

  describe('Not Authorized', () => {
    it('should not be Authorized if token has expired', async () => {
      const payload: CreateTowerReqDTO = {
        betAmount: 4,
        difficulty: 'NIGHTMARE',
      };
      const expiredToken =
        '"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6eyJpZCI6MSwibmFtZSI6IkFkbWluIiwiX19lbnRpdHkiOiJSb2xlIn0sInNlc3Npb25JZCI6MjQsImlhdCI6MTY5ODA0MTc3NywiZXhwIjoxNjk4MDQyNjc3fQ.4ehT3E_lbseoy7FtM1xz2C0tIebLLH4IjDQeIcXBOA4';
      await request(APP_URL)
        .post('/api/tower/create')
        .set('Authorization', `Bearer ${expiredToken}`)
        .send(payload);
    });
    it('should not be Authorized if no token has provided', async () => {
      const payload: CreateTowerReqDTO = {
        betAmount: 4,
        difficulty: 'NIGHTMARE',
      };
      await request(APP_URL)
        .post('/api/tower/create')
        .send(payload)
        .expect(401);
    });
  });

  describe('cashout endpoint: POST /api/tower/cashout', () => {
    let response;
    beforeEach(async () => {
      response = await request(APP_URL)
        .post('/api/tower/cashout')
        .set('Authorization', `Bearer ${token}`);
    });
    it('should return bad request 400 if game not found', async () => {
      const latestGame = await towerRepository.findOne({
        where: {
          user: { id: userId },
        },
        order: { createdAt: 'DESC' },
      });

      if (
        latestGame?.state !== 'IN_PROGRESS' &&
        latestGame?.tilesOpened === 0
      ) {
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          message: 'Game not found',
          data: null,
          status: false,
        });
      }
    });
    it('should not cashout when no tiles where opened', async () => {
      const latestGame = await towerRepository.findOne({
        where: {
          user: { id: userId },
        },
        order: { createdAt: 'DESC' },
      });
      if (latestGame?.state === 'IN_PROGRESS' && latestGame.tilesOpened === 0) {
        expect(response.status).toBe(201);
        expect(response.body).toBeDefined();
        expect(response.body).toEqual({
          message: 'You have not opened any tiles yet',
          data: null,
          status: false,
        });
      }
    });
    it('should return 200 response and cashout the game', () => {
      if (
        towerInProgress &&
        towerInProgress.state === 'IN_PROGRESS' &&
        towerInProgress.tilesOpened > 0
      )
        expect(response.status).toBe(200);
    });
  });

  async function simulateWinGame(userId, token) {
    // Fetch the game in progress
    const towerInProgress = await towerRepository.findOne({
      where: {
        user: { id: userId },
        state: 'IN_PROGRESS',
      },
      order: { createdAt: 'DESC' },
    });

    if (towerInProgress) {
      // Find all safe tiles
      const generateMap = towerInProgress.generatedMap;
      const safeTileCoordinates: number[] = [];

      for (let y = 0; y < generateMap[towerInProgress.activeRow].length; y++) {
        if (generateMap[towerInProgress.activeRow][y] === 1) {
          safeTileCoordinates.push(y);
        }
      }
      if (safeTileCoordinates.length > 0) {
        // Select a safe tile randomly
        const selectedSafeTile =
          safeTileCoordinates[
            Math.floor(Math.random() * safeTileCoordinates.length)
          ];

        // Open the safe tile
        const payload = {
          gameId: towerInProgress.gameId,
          tilePosition: selectedSafeTile,
        };
        await request(APP_URL)
          .post('/api/tower/openTile')
          .set('Authorization', `Bearer ${token}`)
          .send(payload);

        // Cash out
        await request(APP_URL)
          .post('/api/tower/cashout')
          .set('Authorization', `Bearer ${token}`);
      }
    }
  }
  async function simulateLoseGame(userId, token) {
    // Fetch the game in progress
    const towerInProgress = await towerRepository.findOne({
      where: {
        user: { id: userId },
        state: 'IN_PROGRESS',
      },
      order: { createdAt: 'DESC' },
    });

    if (towerInProgress) {
      // Find all mine tiles
      const generateMap = towerInProgress.generatedMap;
      const towerTileCoordinates: { x: number; y: number }[] = [];
      for (let x = 0; x < generateMap.length; x++) {
        for (let y = 0; y < generateMap[x].length; y++) {
          if (generateMap[x][y] === 2) {
            // 1 represents a mine
            towerTileCoordinates.push({ x, y });
          }
        }
      }

      if (towerTileCoordinates.length > 0) {
        // Select a mine tile randomly
        const selectedMineTile =
          towerTileCoordinates[
            Math.floor(Math.random() * towerTileCoordinates.length)
          ];

        // Open the mine tile
        const payload = {
          gameId: towerInProgress.gameId,
          ...selectedMineTile,
        };
        await request(APP_URL)
          .post('/api/tower/openTile')
          .set('Authorization', `Bearer ${token}`)
          .send(payload);

        // No cash out as the game is lost
      }
    }
  }
  async function simulateOpenSafeTile(
    userId,
    token,
  ): Promise<{
    response: request.Response;
    multiplier: number;
    profit: number;
    userMap: any;
    activeRow: number;
    blockPosition: number;
  }> {
    // Fetch the game in progress
    const towerInProgress = await towerRepository.findOne({
      where: {
        user: { id: userId },
        state: 'IN_PROGRESS',
      },
      order: { createdAt: 'DESC' },
    });

    if (towerInProgress) {
      const generateMap = towerInProgress.generatedMap;
      const safeTileCoordinates: number[] = [];

      for (let y = 0; y < generateMap[towerInProgress.activeRow].length; y++) {
        if (generateMap[towerInProgress.activeRow][y] === 1) {
          safeTileCoordinates.push(y);
        }
      }
      if (safeTileCoordinates.length > 0) {
        // Select a safe tile randomly
        const selectedSafeTile =
          safeTileCoordinates[
            Math.floor(Math.random() * safeTileCoordinates.length)
          ];

        // Open the safe tile
        const payload = {
          gameId: towerInProgress.gameId,
          tilePosition: selectedSafeTile,
        };
        const response = await request(APP_URL)
          .post('/api/tower/openTile')
          .set('Authorization', `Bearer ${token}`)
          .send(payload);
        return {
          response: response.body,
          multiplier: response.body.data.multiplier,
          profit: response.body.data.profit,
          userMap: response.body.data.userMap,
          activeRow: response.body.data.activeRow,
          blockPosition: response.body.data.blockPosition,
        };
      }
    }
    return {} as {
      response: request.Response;
      multiplier: number;
      profit: number;
      userMap: any;
      activeRow: number;
      blockPosition: number;
    };
  }
  async function simulateOpenUnsafeTile(
    userId,
    token,
  ): Promise<{
    response: request.Response;
    generatedMap: any;
    activeRow: number;
    blockPosition: number;
    userMap: any;
  }> {
    // Fetch the game in progress
    const towerInProgress = await towerRepository.findOne({
      where: {
        user: { id: userId },
        state: 'IN_PROGRESS',
      },
      order: { createdAt: 'DESC' },
    });

    if (towerInProgress) {
      const generateMap = towerInProgress.generatedMap;
      const unsafeTileCoordinates: number[] = [];

      for (let y = 0; y < generateMap[towerInProgress.activeRow].length; y++) {
        if (generateMap[towerInProgress.activeRow][y] === 2) {
          unsafeTileCoordinates.push(y);
        }
      }
      if (unsafeTileCoordinates.length > 0) {
        // Select a tower tile randomly
        const selectedSafeTile =
          unsafeTileCoordinates[
            Math.floor(Math.random() * unsafeTileCoordinates.length)
          ];

        // Open the unsafe tile
        const payload = {
          gameId: towerInProgress.gameId,
          tilePosition: selectedSafeTile,
        };
        const response = await request(APP_URL)
          .post('/api/tower/openTile')
          .set('Authorization', `Bearer ${token}`)
          .send(payload);
        return {
          response: response.body,
          generatedMap: response.body.data.generatedMap,
          userMap: response.body.data.userMap,
          activeRow: response.body.data.activeRow,
          blockPosition: response.body.data.blockPosition,
        };
      }
    }
    return {} as {
      response: request.Response;
      generatedMap: any;
      userMap: any;
      activeRow: number;
      blockPosition: number;
    };
  }
  async function simulateOpenLastSafeTile(
    userId,
    token,
  ): Promise<{
    response: request.Response;
    multiplier: number;
    profit: number;
    userMap: any;
    generatedMap: any;
    activeRow: number;
    blockPosition: number;
  }> {
    // Fetch the game in progress
    const towerInProgress = await towerRepository.findOne({
      where: {
        user: { id: userId },
        state: 'IN_PROGRESS',
      },
      order: { createdAt: 'DESC' },
    });

    if (
      towerInProgress &&
      towerInProgress.activeRow === 0 &&
      towerInProgress.state === 'CASHED_OUT'
    ) {
      const generateMap = towerInProgress.generatedMap;
      const safeTileCoordinates: number[] = [];

      for (let y = 0; y < generateMap[0].length; y++) {
        if (generateMap[0][y] === 1) {
          safeTileCoordinates.push(y);
        }
      }
      if (safeTileCoordinates.length > 0) {
        // Select a safe tile randomly
        const selectedSafeTile =
          safeTileCoordinates[
            Math.floor(Math.random() * safeTileCoordinates.length)
          ];

        // Open the safe tile
        const payload = {
          gameId: towerInProgress.gameId,
          tilePosition: selectedSafeTile,
        };
        const response = await request(APP_URL)
          .post('/api/tower/openTile')
          .set('Authorization', `Bearer ${token}`)
          .send(payload);
        return {
          response: response.body,
          multiplier: response.body.data.multiplier,
          profit: response.body.data.profit,
          userMap: response.body.data.userMap,
          activeRow: response.body.data.activeRow,
          generatedMap: response.body.data.generatedMap,
          blockPosition: response.body.data.blockPosition,
        };
      }
    }
    return {} as {
      response: request.Response;
      multiplier: number;
      profit: number;
      userMap: any;
      activeRow: number;
      generatedMap: any;
      blockPosition: number;
    };
  }
  const getMessageToSign = async (address: string) => {
    const messageResponse = await request(APP_URL)
      .post('/api/auth/message')
      .send({ walletAddress: address });

    expect(messageResponse.body).toBeDefined();
    expect(messageResponse.body.status).toBe(true);
    expect(messageResponse.body.data).toBeDefined();
    return messageResponse.body.data;
  };
});
