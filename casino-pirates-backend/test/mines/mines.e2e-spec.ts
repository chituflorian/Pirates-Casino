import request from 'supertest';
import { APP_URL, PRIVATE_KEYS } from '../utils/constants';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { INestApplication } from '@nestjs/common';
import { Mines } from '../../src/mines/entities/mines.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlatformConfigService } from '../../src/config/platformconfig/platformconfig.service';
import { MinesModule } from '../../src/mines/mines.module';
import { MinesRepository } from '../../src/mines/mines.repository';
import { MinesCreateDTO } from '../../src/mines/dto/MinesDTO';
import { OpenTileDTO } from '../../src/mines/dto/OpenTileDTO';
import { User } from '../../src/users/entities/user.entity';
import { ethers } from 'ethers';

describe('MinesController (e2e)', () => {
  let token: string;
  let userId: number;
  let app: INestApplication;
  let platformConfigService: PlatformConfigService;
  let minesRepository: Repository<Mines>;
  let userRepository: Repository<User>;
  let maxAmount: number;
  let minAmount: number;
  let status: number;
  let maxWin: number;
  let minesInProgress: Mines | null;

  let userAfterGameCreation: User;
  let userBeforeGameCreation: User;
  let initialBalance: number;
  let finalBalance: number;

  let gameData;
  const profitSteps: number[] = [
    1.03, 1.07, 1.13, 1.18, 1.25, 1.31, 1.39, 1.48, 1.58, 1.69, 1.82, 1.97,
    2.15, 2.37, 2.64, 2.97, 3.39, 3.96, 4.75, 5.93, 7.91, 11.875, 23.75,
  ];

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule, MinesModule],
      providers: [
        MinesRepository,
        {
          provide: getRepositoryToken(Mines),
          useClass: Repository,
        },
      ],
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

    console.log(loginResponse.body.data.token, 'loginResponse.body.data.token');
    token = loginResponse.body.data.token;
    userId = loginResponse.body.data.user.id;

    minesRepository = module.get<Repository<Mines>>(getRepositoryToken(Mines));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    platformConfigService = module.get<PlatformConfigService>(
      PlatformConfigService,
    );

    maxAmount = Number(await platformConfigService.get('mines.MaxAmount'));
    minAmount = Number(await platformConfigService.get('mines.MinAmount'));
    maxWin = Number(await platformConfigService.get('mines.MaxWin'));
    status = Number(await platformConfigService.get('mines.Status'));

    const allGamesInProgress: Mines[] = await minesRepository.find({
      where: {
        user: { id: userId },
        state: 'IN_PROGRESS',
      },
      order: { createdAt: 'DESC' },
    });
    for (const game of allGamesInProgress) {
      await minesRepository.delete(game.id);
    }
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
    it('should have correct settings for mines game', () => {
      expect(maxWin).toBe(500);
      expect(maxAmount).toBe(50);
      expect(minAmount).toBe(1);
      expect(status).toBe(1);
    });
  });

  describe.skip('DTO types ensured', () => {
    it('should create a game and return a DTO with correct structure and types', async () => {
      const payload: MinesCreateDTO = {
        mines: 2,
        amount: maxAmount,
      };
      const response = await request(APP_URL)
        .post('/api/mines/create')
        .set('Authorization', `Bearer ${token}`)
        .send(payload);

      // Check the status of the response
      expect(response.status).toBe(201);
      expect(response.body.status).toBe(true);

      // Check the types of the fields in the response body
      gameData = response.body.data;

      const { success, gameId, userMap, profitSteps } = gameData;

      expect(typeof success).toBe('boolean');
      expect(success).toBe(true);
      expect(typeof gameId).toBe('string');
      expect(Array.isArray(userMap)).toBe(true);
      expect(Array.isArray(profitSteps)).toBe(true);
      //!important
      expect(response.body.data.generatedMap).toBeUndefined();
      expect(userMap).toEqual([
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
      ]);

      expect(profitSteps).toEqual([
        1.03, 1.07, 1.13, 1.18, 1.25, 1.31, 1.39, 1.48, 1.58, 1.69, 1.82, 1.97,
        2.15, 2.37, 2.64, 2.97, 3.39, 3.96, 4.75, 5.93, 7.91, 11.875, 23.75,
      ]);

      await simulateWinGame(userId, token);
    });
    it('should open a safe tile and return a DTO with correct structure and types', async () => {
      expect(minesInProgress).toBeUndefined();
      await request(APP_URL)
        .post('/api/mines/create')
        .set('Authorization', `Bearer ${token}`)
        .send({
          mines: 23,
          amount: maxAmount,
        })
        .expect(201)
        .expect(({ body }) => {
          expect(body).toBeDefined();
          expect(body.status).toBe(true);
        });

      const { response, multiplier, profit, userMap } =
        await simulateOpenSafeTile(userId, token);

      expect(response).toEqual({
        message: 'ok',
        data: {
          success: true,
          isMine: false,
          userMap: userMap,
          lastTile: false,
          profit: profit,
          multiplier: multiplier,
        },
        status: true,
      });

      const gameData = Object(response).data;

      expect(gameData).toEqual({
        success: expect.any(Boolean),
        isMine: expect.any(Boolean),
        userMap: expect.any(Array),
        lastTile: expect.any(Boolean),
        profit: expect.any(Number),
        multiplier: expect.any(Number),
      });

      await request(APP_URL)
        .post('/api/mines/cashout')
        .set('Authorization', `Bearer ${token}`);

      expect(minesInProgress).toBeUndefined();
    });
    it('should open a mine tile and return a DTO with correct structure and types', async () => {
      expect(minesInProgress).toBeUndefined();
      await request(APP_URL)
        .post('/api/mines/create')
        .set('Authorization', `Bearer ${token}`)
        .send({
          mines: 23,
          amount: maxAmount,
        })
        .expect(201)
        .expect(({ body }) => {
          expect(body).toBeDefined();
          expect(body.status).toBe(true);
        });

      const { response, generatedMap, userMap } = await simulateOpenUnsafeTile(
        userId,
        token,
      );

      expect(response).toEqual({
        message: 'ok',
        data: {
          success: true,
          gameOver: true,
          isMine: true,
          userMap: userMap,
          generatedMap: generatedMap,
          lastTile: false,
          profit: 0,
          multiplier: 0,
        },
        status: true,
      });

      const gameData = Object(response).data;

      expect(gameData).toEqual({
        success: expect.any(Boolean),
        gameOver: expect.any(Boolean),
        generatedMap: expect.any(Array),
        isMine: expect.any(Boolean),
        userMap: expect.any(Array),
        lastTile: expect.any(Boolean),
        profit: expect.any(Number),
        multiplier: expect.any(Number),
      });

      expect(minesInProgress).toBeUndefined();
    });
    it('should open the last safe tile and return a DTO with correct structure and types', async () => {
      expect(minesInProgress).toBeUndefined();
      await request(APP_URL)
        .post('/api/mines/create')
        .set('Authorization', `Bearer ${token}`)
        .send({
          mines: 24,
          amount: maxAmount,
        })
        .expect(201)
        .expect(({ body }) => {
          expect(body).toBeDefined();
          expect(body.status).toBe(true);
        });

      const { response, generatedMap, userMap } = await simulateOpenSafeTile(
        userId,
        token,
      );

      expect(response).toEqual({
        message: 'ok',
        data: {
          success: true,
          gameOver: true,
          generatedMap: generatedMap,
          isMine: false,
          userMap: userMap,
          lastTile: true,
          profit: maxWin,
          multiplier: 23.75,
        },
        status: true,
      });

      const gameData = Object(response).data;

      expect(gameData).toEqual({
        success: expect.any(Boolean),
        gameOver: expect.any(Boolean),
        generatedMap: expect.any(Array),
        isMine: expect.any(Boolean),
        userMap: expect.any(Array),
        lastTile: expect.any(Boolean),
        profit: expect.any(Number),
        multiplier: expect.any(Number),
      });

      expect(minesInProgress).toBeUndefined();
    });
  });

  describe.skip('Balance rules', () => {
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
        .post('/api/mines/create')
        .set('Authorization', `Bearer ${token}`)
        .send({ mines: 2, amount: maxAmount });

      userAfterGameCreation = (await userRepository.findOne({
        where: {
          id: userId,
        },
        cache: false,
      })) as User;

      finalBalance = userAfterGameCreation ? userAfterGameCreation.balance : 0;
      expect(Number(finalBalance)).toEqual(
        Number(initialBalance) - Number(maxAmount),
      );
      await simulateWinGame(userId, token);
    });
    it('should add the correct balance when a game is won', async () => {
      await request(APP_URL)
        .post('/api/mines/create')
        .set('Authorization', `Bearer ${token}`)
        .send({ mines: 2, amount: maxAmount });

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
        Number(initialBalance) + Number(maxAmount * profitSteps[0]),
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
        .post('/api/mines/create')
        .set('Authorization', `Bearer ${token}`)
        .send({ mines: 24, amount: maxAmount });
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
      const payload: MinesCreateDTO = {
        mines: 4,
        amount: maxAmount,
      };

      const userBeforeGameCreation: User = (await userRepository.findOne({
        where: {
          id: userId,
        },
      })) as User;
      expect(userBeforeGameCreation).toBeDefined();

      const response = await request(APP_URL)
        .post('/api/mines/create')
        .set('Authorization', `Bearer ${token}`)
        .send(payload);

      if (userBeforeGameCreation.balance < payload.amount) {
        expect(response.status).toBe(201);
        expect(response.body.status).toBe(false);
        expect(response.body.message).toBe('Insufficient balance');
        expect(response.body.data).toBe(null);
      }
      await simulateLoseGame(userId, token);
    });
    it('should not increment balance more than the maximum win', async () => {
      await request(APP_URL)
        .post('/api/mines/create')
        .set('Authorization', `Bearer ${token}`)
        .send({ mines: 2, amount: maxAmount });

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
      const payload: MinesCreateDTO = {
        mines: 24,
        amount: maxAmount + 1,
      };

      const response = await request(APP_URL)
        .post('/api/mines/create')
        .set('Authorization', `Bearer ${token}`)
        .send(payload);

      expect(response.status).toBe(201);
      expect(response.body.status).toBe(false);
      expect(response.body.message).toBe('Maximum bet exceeded');
      expect(response.body.data).toBe(null);

      await simulateLoseGame(userId, token);
    });
    it('should not allow creating a game if the bet amount is less than the minimum bet', async () => {
      const payload: MinesCreateDTO = {
        mines: 24,
        amount: minAmount - 1,
      };

      const response = await request(APP_URL)
        .post('/api/mines/create')
        .set('Authorization', `Bearer ${token}`)
        .send(payload);

      expect(response.status).toBe(201);
      expect(response.body.status).toBe(false);
      expect(response.body.message).toBe('amount must be a positive number');
      expect(response.body.data).toBe(null);

      await simulateLoseGame(userId, token);
    });
  });

  describe('Game safety: ', () => {
    it('should not create a game if a game is already in progress', async () => {
      const payload: MinesCreateDTO = {
        mines: 24,
        amount: 2,
      };

      await request(APP_URL)
        .post('/api/mines/create')
        .set('Authorization', `Bearer ${token}`)
        .send(payload);

      const minesGame = await minesRepository.findOne({
        where: {
          user: { id: userId },
          state: 'IN_PROGRESS',
        },
        order: { createdAt: 'DESC' },
      });

      expect(minesGame).toBeDefined();

      if (minesGame) {
        const response = await request(APP_URL)
          .post('/api/mines/create')
          .set('Authorization', `Bearer ${token}`)
          .send(payload);

        expect(response.status).toBe(201);
        expect(response.body).toEqual({
          message: 'You already have a game in progress',
          data: null,
          status: false,
        });
      }

      await simulateLoseGame(userId, token);
    });
    it('should not allow opening a tile for a not in progress game id => 400 game not found', async () => {
      const payload: OpenTileDTO = {
        gameId: '56f2f0ee-7b37-4a98-9d4d-8d883bac7bae',
        x: 0,
        y: 1,
      };
      if (minesInProgress)
        await request(APP_URL)
          .post('/api/mines/tile')
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
    });
    it('should not allow opening a tile for negative coord', async () => {
      await request(APP_URL)
        .post('/api/mines/create')
        .set('Authorization', `Bearer ${token}`)
        .send({ mines: 4, amount: 2 });

      minesInProgress = await minesRepository.findOne({
        where: {
          user: { id: userId },
          state: 'IN_PROGRESS',
        },
        order: { createdAt: 'DESC' },
      });
      expect(minesInProgress).toBeDefined();
      const payload = {
        gameId: minesInProgress?.gameId,
        x: -1,
        y: -1,
      };
      await request(APP_URL)
        .post('/api/mines/tile')
        .set('Authorization', `Bearer ${token}`)
        .send(payload)
        .expect(200)
        .expect(({ body }) => {
          expect(body).toBeDefined();
          expect(body).toEqual({
            data: null,
            message: 'x must not be less than 0',
            status: false,
          });
        });
      await simulateWinGame(userId, token);
    });
    it('should not create a game if mines are less than minimum number', async () => {
      const payload = {
        mines: 1,
        amount: maxAmount,
      };

      await request(APP_URL)
        .post('/api/mines/create')
        .set('Authorization', `Bearer ${token}`)
        .send(payload)
        .expect(201)
        .expect(({ body }) => {
          expect(body).toBeDefined();
          expect(body).toEqual({
            message: 'Invalid number of mines',
            data: null,
            status: false,
          });
        });
    });

    it('should not create a game if mines are greater than minimum number', async () => {
      const payload = {
        mines: 999,
        amount: maxAmount,
      };

      await request(APP_URL)
        .post('/api/mines/create')
        .set('Authorization', `Bearer ${token}`)
        .send(payload)
        .expect(201)
        .expect(({ body }) => {
          expect(body).toBeDefined();
          expect(body).toEqual({
            message: 'Invalid number of mines',
            data: null,
            status: false,
          });
        });
    });

    it('should not create a game if amount is less than minimum bet', async () => {
      const payload = {
        mines: 3,
        amount: Number(minAmount - 1),
      };

      await request(APP_URL)
        .post('/api/mines/create')
        .set('Authorization', `Bearer ${token}`)
        .send(payload)
        .expect(201)
        .expect(({ body }) => {
          expect(body).toBeDefined();
          expect(body).toEqual({
            status: false,
            message: 'amount must be a positive number',
            data: null,
          });
        });
    });

    it('should not create a game if mines is negative', async () => {
      const payload = {
        mines: -0.1,
        amount: maxAmount,
      };
      await request(APP_URL)
        .post('/api/mines/create')
        .set('Authorization', `Bearer ${token}`)
        .send(payload)
        .expect(201)
        .expect(({ body }) => {
          expect(body).toBeDefined();
          expect(body).toEqual({
            message: 'mines must be an integer number',
            data: null,
            status: false,
          });
        });
    });

    it('should not create a game if betAmount is negative', async () => {
      const payload = {
        mines: 3,
        amount: -0.1,
      };
      await request(APP_URL)
        .post('/api/mines/create')
        .set('Authorization', `Bearer ${token}`)
        .send(payload)
        .expect(201)
        .expect(({ body }) => {
          expect(body).toBeDefined();
          expect(body).toEqual({
            message: 'amount must be a positive number',
            data: null,
            status: false,
          });
        });
    });

    it('should not create a game if betAmount is not a number', async () => {
      const payload = {
        mines: 2,
        amount: 'text',
      };
      await request(APP_URL)
        .post('/api/mines/create')
        .set('Authorization', `Bearer ${token}`)
        .send(payload)
        .expect(201)
        .expect(({ body }) => {
          expect(body).toBeDefined();
          expect(body).toEqual({
            message:
              'amount must be a positive number, amount must be a number conforming to the specified constraints',
            data: null,
            status: false,
          });
        });
    });

    it('should not create a game if mines is float number', async () => {
      const payload = {
        mines: 2.5,
        amount: 5,
      };
      await request(APP_URL)
        .post('/api/mines/create')
        .set('Authorization', `Bearer ${token}`)
        .send(payload)
        .expect(201)
        .expect(({ body }) => {
          expect(body).toBeDefined();
          expect(body).toEqual({
            status: false,
            message: 'mines must be an integer number',
            data: null,
          });
        });
    });

    it('should not create a game if mines is not a number', async () => {
      const payload = {
        mines: 'text',
        amount: 1,
      };
      await request(APP_URL)
        .post('/api/mines/create')
        .set('Authorization', `Bearer ${token}`)
        .send(payload)
        .expect(201)
        .expect(({ body }) => {
          expect(body).toBeDefined();
          expect(body).toEqual({
            status: false,
            message: 'mines must be an integer number',
            data: null,
          });
        });
    });

    // Test case to check if the game doesn't allow actions after it's already finished
    it('should not allow actions after game is finished', async () => {
      // Add your test implementation here
    });

    // Test case to check if the game doesn't allow creating a new game with the same gameId
    it('should not allow creating a new game with the same gameId', async () => {
      // Add your test implementation here
    });

    // Test case to check if the game doesn't allow cashing out if no tiles were opened
    it('should not allow cashing out if no tiles were opened', async () => {
      // Add your test implementation here
    });

    // Test case to check if the game doesn't allow opening a tile that's already opened
    it('should not allow opening a tile that is already opened', async () => {
      // Add your test implementation here
    });

    // Test case to check if the game doesn't allow opening a tile after the game is lost
    it('should not allow opening a tile after the game is lost', async () => {
      // Add your test implementation here
    });

    // Test case to check if the game doesn't allow cashing out after the game is lost
    it('should not allow cashing out after the game is lost', async () => {
      // Add your test implementation here
    });

    // Test case to check if the game doesn't allow opening a tile after cashing out
    it('should not allow opening a tile after cashing out', async () => {
      // Add your test implementation here
    });
  });

  describe.skip('Race condition attacks', () => {
    it('should prevent race condition attacks', async () => {
      // Create a new game
      const newGameResponse = await request(APP_URL)
        .post('/api/mines/create')
        .set('Authorization', `Bearer ${token}`)
        .send({ mines: 4, amount: maxAmount });

      // Assert that the game state is 'IN_PROGRESS'
      expect(newGameResponse.body.data.state).toBe('IN_PROGRESS');

      minesInProgress = await minesRepository.findOne({
        where: {
          user: { id: userId },
          state: 'IN_PROGRESS',
        },
        order: { createdAt: 'DESC' },
      });

      const payload = {
        gameId: minesInProgress?.gameId,
        x: 0,
        y: 3,
      };

      // Create two parallel requests
      const requestOne = request(APP_URL)
        .post('/api/mines/tile')
        .set('Authorization', `Bearer ${token}`)
        .send(payload);

      const requestTwo = request(APP_URL)
        .post('/api/mines/tile')
        .set('Authorization', `Bearer ${token}`)
        .send(payload);

      // Execute the requests
      const [responseOne, responseTwo] = await Promise.all([
        requestOne,
        requestTwo,
      ]);

      // Check the responses
      // Depending on your implementation, one of the requests should fail due to the @LockRequest decorator
      expect(responseOne.status).toBe(200);
      expect(responseTwo.status).not.toBe(200);

      await simulateWinGame(userId, token);
    });
  });

  describe('Not Authorized', () => {
    it('should not be Authorized if token has expired', async () => {
      const payload: MinesCreateDTO = {
        mines: 4,
        amount: maxAmount,
      };
      const expiredToken =
        '"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6eyJpZCI6MSwibmFtZSI6IkFkbWluIiwiX19lbnRpdHkiOiJSb2xlIn0sInNlc3Npb25JZCI6MjQsImlhdCI6MTY5ODA0MTc3NywiZXhwIjoxNjk4MDQyNjc3fQ.4ehT3E_lbseoy7FtM1xz2C0tIebLLH4IjDQeIcXBOA4';
      await request(APP_URL)
        .post('/api/mines/create')
        .set('Authorization', `Bearer ${expiredToken}`)
        .send(payload);
    });
    it('should not be Authorized if no token has provided', async () => {
      const payload: MinesCreateDTO = {
        mines: 4,
        amount: maxAmount,
      };
      await request(APP_URL)
        .post('/api/mines/create')
        .send(payload)
        .expect(401);
    });
  });

  describe.skip('create mines game endpoint: POST /api/mines/create', () => {
    it.skip('should not create a game if there is not enough balance', async () => {
      const payload: MinesCreateDTO = {
        mines: 4,
        amount: maxAmount,
      };

      const userBeforeGameCreation: User = (await userRepository.findOne({
        where: {
          id: userId,
        },
      })) as User;
      expect(userBeforeGameCreation).toBeDefined();

      const response = await request(APP_URL)
        .post('/api/mines/create')
        .set('Authorization', `Bearer ${token}`)
        .send(payload);

      if (userBeforeGameCreation.balance < payload.amount) {
        expect(response.status).toBe(201);
        expect(response.body.status).toBe(false);
        expect(response.body.message).toBe('Insufficient balance');
        expect(response.body.data).toBe(null);
      }
    });

    it('should not create a game if a game is already in progress', async () => {
      const payload: MinesCreateDTO = {
        mines: 4,
        amount: maxAmount,
      };

      const response = await request(APP_URL)
        .post('/api/mines/create')
        .set('Authorization', `Bearer ${token}`)
        .send(payload);

      if (minesInProgress) {
        expect(response.status).toBe(201);
        expect(response.body).toEqual({
          message: 'You already have a game in progress',
          data: null,
          status: false,
        });
      }
    });

    it('should not create a game if mines are less than minimum number', async () => {
      const payload = {
        mines: 1,
        amount: maxAmount,
      };

      await request(APP_URL)
        .post('/api/mines/create')
        .set('Authorization', `Bearer ${token}`)
        .send(payload)
        .expect(201)
        .expect(({ body }) => {
          expect(body).toBeDefined();
          expect(body).toEqual({
            message: 'Invalid number of mines',
            data: null,
            status: false,
          });
        });
    });

    it('should not create a game if mines are greater than minimum number', async () => {
      const payload = {
        mines: 999,
        amount: maxAmount,
      };

      await request(APP_URL)
        .post('/api/mines/create')
        .set('Authorization', `Bearer ${token}`)
        .send(payload)
        .expect(201)
        .expect(({ body }) => {
          expect(body).toBeDefined();
          expect(body).toEqual({
            message: 'Invalid number of mines',
            data: null,
            status: false,
          });
        });
    });

    it('should not create a game if amount is less than minimum bet', async () => {
      const payload = {
        mines: 3,
        amount: Number(minAmount - 1),
      };

      await request(APP_URL)
        .post('/api/mines/create')
        .set('Authorization', `Bearer ${token}`)
        .send(payload)
        .expect(201)
        .expect(({ body }) => {
          expect(body).toBeDefined();
          expect(body).toEqual({
            status: false,
            message: 'amount must be a positive number',
            data: null,
          });
        });
    });

    it('should not create a game if amount is greater than maximum bet', async () => {
      const payload = {
        mines: 3,
        amount: Number(maxAmount + 1),
      };

      await request(APP_URL)
        .post('/api/mines/create')
        .set('Authorization', `Bearer ${token}`)
        .send(payload)
        .expect(201)
        .expect(({ body }) => {
          expect(body).toBeDefined();
          expect(body).toEqual({
            message: 'Maximum bet exceeded',
            data: null,
            status: false,
          });
        });
    });

    it('should not create a game if mines is negative', async () => {
      const payload = {
        mines: -0.1,
        amount: maxAmount,
      };
      await request(APP_URL)
        .post('/api/mines/create')
        .set('Authorization', `Bearer ${token}`)
        .send(payload)
        .expect(201)
        .expect(({ body }) => {
          expect(body).toBeDefined();
          expect(body).toEqual({
            message: 'mines must be an integer number',
            data: null,
            status: false,
          });
        });
    });

    it('should not create a game if betAmount is negative', async () => {
      const payload = {
        mines: 3,
        amount: -0.1,
      };
      await request(APP_URL)
        .post('/api/mines/create')
        .set('Authorization', `Bearer ${token}`)
        .send(payload)
        .expect(201)
        .expect(({ body }) => {
          expect(body).toBeDefined();
          expect(body).toEqual({
            message: 'amount must be a positive number',
            data: null,
            status: false,
          });
        });
    });

    it('should not create a game if betAmount is not a number', async () => {
      const payload = {
        mines: 2,
        amount: 'text',
      };
      await request(APP_URL)
        .post('/api/mines/create')
        .set('Authorization', `Bearer ${token}`)
        .send(payload)
        .expect(201)
        .expect(({ body }) => {
          expect(body).toBeDefined();
          expect(body).toEqual({
            message:
              'amount must be a positive number, amount must be a number conforming to the specified constraints',
            data: null,
            status: false,
          });
        });
    });

    it('should not create a game if mines is float number', async () => {
      const payload = {
        mines: 2.5,
        amount: 5,
      };
      await request(APP_URL)
        .post('/api/mines/create')
        .set('Authorization', `Bearer ${token}`)
        .send(payload)
        .expect(201)
        .expect(({ body }) => {
          expect(body).toBeDefined();
          expect(body).toEqual({
            status: false,
            message: 'mines must be an integer number',
            data: null,
          });
        });
    });

    it('should not create a game if mines is not a number', async () => {
      const payload = {
        mines: 'text',
        amount: 1,
      };
      await request(APP_URL)
        .post('/api/mines/create')
        .set('Authorization', `Bearer ${token}`)
        .send(payload)
        .expect(201)
        .expect(({ body }) => {
          expect(body).toBeDefined();
          expect(body).toEqual({
            status: false,
            message: 'mines must be an integer number',
            data: null,
          });
        });
    });

    it('should not be Authorized if token has expired', async () => {
      const payload: MinesCreateDTO = {
        mines: 4,
        amount: maxAmount,
      };
      const expiredToken =
        '"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6eyJpZCI6MSwibmFtZSI6IkFkbWluIiwiX19lbnRpdHkiOiJSb2xlIn0sInNlc3Npb25JZCI6MjQsImlhdCI6MTY5ODA0MTc3NywiZXhwIjoxNjk4MDQyNjc3fQ.4ehT3E_lbseoy7FtM1xz2C0tIebLLH4IjDQeIcXBOA4';
      await request(APP_URL)
        .post('/api/mines/create')
        .set('Authorization', `Bearer ${expiredToken}`)
        .send(payload);
    });

    it('should not be Authorized if no token has provided', async () => {
      const payload: MinesCreateDTO = {
        mines: 4,
        amount: maxAmount,
      };
      await request(APP_URL)
        .post('/api/mines/create')
        .send(payload)
        .expect(401);
    });

    it('should change game state correctly after each action', async () => {
      // Create a new game
      const newGameResponse = await request(APP_URL)
        .post('/api/mines/create')
        .set('Authorization', `Bearer ${token}`)
        .send({ mines: 4, amount: maxAmount });

      // Assert that the game state is 'IN_PROGRESS'
      expect(newGameResponse.body.data.state).toBe('IN_PROGRESS');

      // Open a tile
      const openTileResponse = await request(APP_URL)
        .post('/api/mines/tile')
        .set('Authorization', `Bearer ${token}`)
        .send({ gameId: newGameResponse.body.data.gameId, x: 0, y: 0 });

      // Assert that the game state is still 'IN_PROGRESS'
      expect(openTileResponse.body.data.state).toBe('IN_PROGRESS');

      // Cash out
      const cashOutResponse = await request(APP_URL)
        .post('/api/mines/cashout')
        .set('Authorization', `Bearer ${token}`)
        .send({ gameId: newGameResponse.body.data.gameId });

      // Assert that the game state is 'CASHED_OUT'
      expect(cashOutResponse.body.data.state).toBe('CASHED_OUT');
    });

    it('should create a game successfully with response 201', async () => {
      const payload: MinesCreateDTO = {
        mines: 4,
        amount: maxAmount,
      };
      minesInProgress = await minesRepository.findOne({
        where: {
          user: { id: userId },
          state: 'IN_PROGRESS',
        },
        order: { createdAt: 'DESC' },
      });

      userBeforeGameCreation = (await userRepository.findOne({
        where: {
          id: userId,
        },
      })) as User;

      expect(userBeforeGameCreation).toBeDefined();

      initialBalance = userBeforeGameCreation
        ? userBeforeGameCreation.balance
        : 0;

      const response = await request(APP_URL)
        .post('/api/mines/create')
        .set('Authorization', `Bearer ${token}`)
        .send(payload);

      const latestGame: Mines | null = await minesRepository.findOne({
        where: {
          user: { id: userId },
        },
        order: { createdAt: 'DESC' },
      });

      userAfterGameCreation = (await userRepository.findOne({
        where: {
          id: userId,
        },
        cache: false,
      })) as User;

      finalBalance = userAfterGameCreation ? userAfterGameCreation.balance : 0;

      if (minesInProgress === null) {
        gameData = response.body.data;

        expect(response.status).toBe(201);
        expect(response.body.status).toBe(true);

        /**
         * Balance TEST
         * should subtract the correct balance when a new game is created
         * */
        expect(Number(finalBalance)).toEqual(
          Number(initialBalance - payload.amount),
        );

        //Response TEST
        expect(gameData.gameId).toBeDefined();
        expect(typeof gameData.gameId).toBe('string');

        expect(gameData.gameOver).toBe(false);
        expect(gameData.isMine).toBe(false);
        expect(gameData.generatedMap).toBeDefined();
        expect(gameData.userMap).toBeDefined();
        expect(gameData.profitSteps).toEqual(profitSteps);
        /**
         * Mines TEST
         * should create a game with the correct number of mines
         * */
        expect(gameData.mines).toEqual(payload.mines);

        /**
         * BetAmount TEST
         * should create a game with the correct betAmount
         * */
        expect(gameData.betAmount).toEqual(payload.amount);

        /**
         * Profit TEST
         * should create a game with the correct profit
         * */
        expect(gameData.profit).toBeGreaterThan(0);

        /**
         * Multiplier TEST
         * should create a game with the correct multiplier
         * */
        expect(gameData.multiplier).toBeGreaterThan(0);

        /**
         * State TEST
         * should create a game with the correct state
         * */
        expect(gameData.state).toBe('IN_PROGRESS');

        /**
         * TilesOpened TEST
         * should create a game with the correct tilesOpened
         * */
        expect(gameData.tilesOpened).toBe(0);

        /**
         * User TEST
         * should create a game with the correct user
         * */
        expect(gameData.user).toBeDefined();
        expect(gameData.user.id).toEqual(userId);

        expect(gameData.userMap).toEqual([
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
        ]);
        expect(gameData.profitSteps).toEqual(profitSteps);

        expect(latestGame).toBeDefined();

        expect(Number(latestGame?.mines)).toEqual(payload.mines);
        expect(Number(latestGame?.betAmount)).toEqual(payload.amount);

        expect(Number(latestGame?.tilesOpened)).toBe(0);
        expect(Number(latestGame?.profit)).toBe(0);
        expect(Number(latestGame?.multiplier)).toStrictEqual(0);
        expect(latestGame?.state).toStrictEqual('IN_PROGRESS');
        expect(latestGame?.user.id).toEqual(userId);
      }
    });

    it.skip('should create a game successfully with response 201 and correct profit steps for different mines number', async () => {
      const payload: MinesCreateDTO = {
        mines: 24,
        amount: maxAmount,
      };
      const loginResponse = await request(APP_URL)
        .post('/api/v1/auth/email/login')
        .send({
          email: 'florian.chitu@example.com',
          password: 'secret',
        });
      const token = loginResponse.body.token;
      const userId = loginResponse.body.user.id;

      if (minesInProgress)
        minesInProgress = await minesRepository.findOne({
          where: {
            user: { id: userId },
            state: 'IN_PROGRESS',
          },
          order: { createdAt: 'DESC' },
        });

      const response = await request(APP_URL)
        .post('/api/mines/create')
        .set('Authorization', `Bearer ${token}`)
        .send(payload);

      if (minesInProgress === null) {
        expect(response.body.data.profitSteps).toEqual([23.75]);
      }
    });
  });

  describe.skip('open tile endpoint: POST /api/mines/openTile', () => {
    beforeAll(async () => {
      minesInProgress = await minesRepository.findOne({
        where: {
          user: { id: userId },
          state: 'IN_PROGRESS',
        },
        order: { createdAt: 'DESC' },
      });
    });

    it('should not open a tile for a not in progress game id => 400 game not found', async () => {
      const payload: OpenTileDTO = {
        gameId: '56f2f0ee-7b37-4a98-9d4d-8d883bac7bae',
        x: 0,
        y: 1,
      };

      if (minesInProgress)
        await request(APP_URL)
          .post('/api/mines/tile')
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
    });
    it('should not open a tile for negative coord', async () => {
      const payload = {
        gameId: minesInProgress?.gameId,
        x: -1,
        y: -1,
      };
      await request(APP_URL)
        .post('/api/mines/tile')
        .set('Authorization', `Bearer ${token}`)
        .send(payload)
        .expect(200)
        .expect(({ body }) => {
          expect(body).toBeDefined();
          expect(body).toEqual({
            message: 'gameId should not be empty, gameId must be a string',
            data: null,
            status: false,
          });
        });
    });
    it('should not open a tile if the gameId is incorrect format', async () => {
      const payload = {
        gameId: Number('56f2f0ee-7b37-4a98-9d4d-8d883bac7bae'),
        x: 0,
        y: 1,
      };
      await request(APP_URL)
        .post('/api/mines/tile')
        .set('Authorization', `Bearer ${token}`)
        .send(payload)
        .expect(200)
        .expect(({ body }) => {
          expect(body).toBeDefined();
          expect(body.status).toEqual(false);
        });
    });
    it('should not open a tile for not number coord', async () => {
      const payload = {
        gameId: minesInProgress?.gameId,
        x: '1',
        y: '1',
      };
      await request(APP_URL)
        .post('/api/mines/tile')
        .set('Authorization', `Bearer ${token}`)
        .send(payload)
        .expect(200)
        .expect(({ body }) => {
          expect(body).toBeDefined();
          expect(body).toEqual({
            message: 'x must not be less than 0, x must be an integer number',
            data: null,
            status: false,
          });
        });
    });
    it('should not open a tile for float numbers', async () => {
      const payload = {
        gameId: minesInProgress?.gameId,
        x: 1.2,
        y: 3.2,
      };
      await request(APP_URL)
        .post('/api/mines/tile')
        .set('Authorization', `Bearer ${token}`)
        .send(payload)
        .expect(200)
        .expect(({ body }) => {
          expect(body).toBeDefined();
          expect(body).toEqual({
            message: 'x must be an integer number',
            data: null,
            status: false,
          });
        });
    });
    it('should not open a tile if payload is missing', async () => {
      const payload = {};
      await request(APP_URL)
        .post('/api/mines/tile')
        .set('Authorization', `Bearer ${token}`)
        .send(payload)
        .expect(200)
        .expect(({ body }) => {
          expect(body).toBeDefined();
          expect(body).toEqual({
            message: 'gameId should not be empty, gameId must be a string',
            data: null,
            status: false,
          });
        });
    });

    it('should return 200 response for an correct tile with a valid response', async () => {
      if (minesInProgress) {
        const userMap: number[][] = minesInProgress.userMap;
        const payload = {
          gameId: minesInProgress?.gameId,
          x: 0,
          y: 3,
        };
        const response = await request(APP_URL)
          .post('/api/mines/tile')
          .set('Authorization', `Bearer ${token}`)
          .send(payload);

        const latestGame = await minesRepository.findOne({
          where: {
            user: { id: userId },
          },
          order: { createdAt: 'DESC' },
        });

        if (userMap[payload.x][payload.y] === 1) {
          expect(response.status).toBe(200);
          expect(response.body.status).toBe(false);
        } else {
          expect(response.status).toBe(200);
          expect(response.body.status).toBe(true);
          const gameData = response.body.data;
          if (gameData.gameOver) {
            expect(gameData.gameOver).toBe(true);
            expect(gameData.isMine).toBe(true);
            expect(gameData.profit).toBe(0);
            expect(gameData.multiplier).toBe(0);
            expect(gameData.generatedMap).toBeDefined();
            expect(gameData.userMap).toBeDefined();

            expect(latestGame?.state).toEqual('LOST');
            expect(Number(latestGame?.multiplier)).toEqual(0);
            expect(Number(latestGame?.profit)).toEqual(0);
            expect(latestGame?.tilesOpened).toEqual(0);
          } else {
            expect(gameData.isMine).toBe(false);
            expect(gameData.userMap).toBeDefined();
            expect(gameData.profit).toBeGreaterThan(
              Number(latestGame?.betAmount),
            );
            expect(Number(gameData.multiplier)).toBeGreaterThan(0);
            expect(gameData.generatedMap).toBeUndefined();
          }
        }
      }
    });
  });

  describe.skip('cashout endpoint: POST /api/mines/cashout', () => {
    let response;
    beforeEach(async () => {
      response = await request(APP_URL)
        .post('/api/mines/cashout')
        .set('Authorization', `Bearer ${token}`);
    });

    it('should return bad request 400 if game not found', async () => {
      const latestGame = await minesRepository.findOne({
        where: {
          user: { id: userId },
        },
        order: { createdAt: 'DESC' },
      });
      if (
        latestGame?.state !== 'IN_PROGRESS' &&
        latestGame?.tilesOpened === 0
      ) {
        expect(response.status).toBe(201);
        expect(response.body).toEqual({
          message: 'Game not found',
          data: null,
          status: false,
        });
      }
    });
    it('should not cashout when no tiles where opened', async () => {
      const latestGame = await minesRepository.findOne({
        where: {
          user: { id: userId },
        },
        order: { createdAt: 'DESC' },
      });
      if (latestGame?.state === 'IN_PROGRESS' && latestGame.tilesOpened === 0) {
        expect(response.status).toBe(200);
        expect(response.body).toBeDefined();
        expect(response.body).toEqual({
          message: 'You have not opened any tiles yet',
          data: null,
          status: false,
        });
      }
    });
    it('should return 200 response and cashout the game', async () => {
      const latestGame = await minesRepository.findOne({
        where: {
          user: { id: userId },
        },
        order: { createdAt: 'DESC' },
      });
      minesInProgress = await minesRepository.findOne({
        where: {
          user: { id: userId },
          state: 'IN_PROGRESS',
        },
        order: { createdAt: 'DESC' },
      });

      initialBalance = userAfterGameCreation
        ? userAfterGameCreation.balance
        : 0;

      userAfterGameCreation = (await userRepository.findOne({
        where: {
          id: userId,
        },
        cache: false,
      })) as User;

      finalBalance = userAfterGameCreation ? userAfterGameCreation.balance : 0;

      if (!minesInProgress) {
        expect(response.status).toBe(201);
        expect(latestGame?.state === 'CASHED_OUT');
        /**
         * Balance TEST
         * should add the correct balance when a game is won
         * */
        expect(Number(finalBalance)).toEqual(
          Number(initialBalance) + Number(maxAmount * profitSteps[0]),
        );

        expect(finalBalance - initialBalance).toBeLessThanOrEqual(maxWin);
      } else if (minesInProgress.tilesOpened === 0) {
        expect(response.status).toBe(201);
        expect(response.body.status).toBe(false);
      }
    });
  });

  const getMessageToSign = async (address: string) => {
    const messageResponse = await request(APP_URL)
      .post('/api/auth/message')
      .send({ walletAddress: address });

    expect(messageResponse.body).toBeDefined();
    expect(messageResponse.body.status).toBe(true);
    expect(messageResponse.body.data).toBeDefined();
    return messageResponse.body.data;
  };

  async function simulateWinGame(userId, token) {
    // Fetch the game in progress
    const minesInProgress = await minesRepository.findOne({
      where: {
        user: { id: userId },
        state: 'IN_PROGRESS',
      },
      order: { createdAt: 'DESC' },
    });

    if (minesInProgress) {
      // Find all safe tiles
      const generateMap = minesInProgress.generatedMap;
      const safeTileCoordinates: { x: number; y: number }[] = [];
      for (let x = 0; x < generateMap.length; x++) {
        for (let y = 0; y < generateMap[x].length; y++) {
          if (generateMap[x][y] === 0) {
            safeTileCoordinates.push({ x, y });
          }
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
          gameId: minesInProgress.gameId,
          ...selectedSafeTile,
        };
        await request(APP_URL)
          .post('/api/mines/tile')
          .set('Authorization', `Bearer ${token}`)
          .send(payload);

        // Cash out
        await request(APP_URL)
          .post('/api/mines/cashout')
          .set('Authorization', `Bearer ${token}`);
      }
    }
  }
  async function simulateLoseGame(userId, token) {
    // Fetch the game in progress
    const minesInProgress = await minesRepository.findOne({
      where: {
        user: { id: userId },
        state: 'IN_PROGRESS',
      },
      order: { createdAt: 'DESC' },
    });

    if (minesInProgress) {
      // Find all mine tiles
      const generateMap = minesInProgress.generatedMap;
      const mineTileCoordinates: { x: number; y: number }[] = [];
      for (let x = 0; x < generateMap.length; x++) {
        for (let y = 0; y < generateMap[x].length; y++) {
          if (generateMap[x][y] === 1) {
            // 1 represents a mine
            mineTileCoordinates.push({ x, y });
          }
        }
      }

      if (mineTileCoordinates.length > 0) {
        // Select a mine tile randomly
        const selectedMineTile =
          mineTileCoordinates[
            Math.floor(Math.random() * mineTileCoordinates.length)
          ];

        // Open the mine tile
        const payload = {
          gameId: minesInProgress.gameId,
          ...selectedMineTile,
        };
        await request(APP_URL)
          .post('/api/mines/tile')
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
    generatedMap: any;
    multiplier: number;
    profit: number;
    userMap: any;
  }> {
    // Fetch the game in progress
    const minesInProgress = await minesRepository.findOne({
      where: {
        user: { id: userId },
        state: 'IN_PROGRESS',
      },
      order: { createdAt: 'DESC' },
    });

    if (minesInProgress) {
      // Find all safe tiles
      const generateMap = minesInProgress.generatedMap;
      const safeTileCoordinates: { x: number; y: number }[] = [];
      for (let x = 0; x < generateMap.length; x++) {
        for (let y = 0; y < generateMap[x].length; y++) {
          if (generateMap[x][y] === 0) {
            safeTileCoordinates.push({ x, y });
          }
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
          gameId: minesInProgress.gameId,
          ...selectedSafeTile,
        };
        const response = await request(APP_URL)
          .post('/api/mines/tile')
          .set('Authorization', `Bearer ${token}`)
          .send(payload);

        return {
          response: response.body,
          generatedMap: response.body.data.generatedMap,
          multiplier: response.body.data.multiplier,
          profit: response.body.data.profit,
          userMap: response.body.data.userMap,
        };
      }
    }
    return {} as {
      response: request.Response;
      generatedMap: any;
      multiplier: number;
      profit: number;
      userMap: any;
    };
  }
  async function simulateOpenUnsafeTile(
    userId,
    token,
  ): Promise<{
    response: request.Response;
    generatedMap: any;
    userMap: any;
  }> {
    // Fetch the game in progress
    const minesInProgress = await minesRepository.findOne({
      where: {
        user: { id: userId },
        state: 'IN_PROGRESS',
      },
      order: { createdAt: 'DESC' },
    });

    if (minesInProgress) {
      // Find all mine tiles
      const generateMap = minesInProgress.generatedMap;
      const mineTileCoordinates: { x: number; y: number }[] = [];
      for (let x = 0; x < generateMap.length; x++) {
        for (let y = 0; y < generateMap[x].length; y++) {
          if (generateMap[x][y] === 1) {
            // 1 represents a mine
            mineTileCoordinates.push({ x, y });
          }
        }
      }

      if (mineTileCoordinates.length > 0) {
        // Select a mine tile randomly
        const selectedMineTile =
          mineTileCoordinates[
            Math.floor(Math.random() * mineTileCoordinates.length)
          ];

        // Open the mine tile
        const payload = {
          gameId: minesInProgress.gameId,
          ...selectedMineTile,
        };
        const response = await request(APP_URL)
          .post('/api/mines/tile')
          .set('Authorization', `Bearer ${token}`)
          .send(payload);
        return {
          response: response.body,
          generatedMap: response.body.data.generatedMap,
          userMap: response.body.data.userMap,
        };
      }
    }
    return {} as {
      response: request.Response;
      generatedMap: any;
      userMap: any;
    };
  }
});
