import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AppModule } from '../../src/app.module';
import { Gems } from '../../src/gems/entities/gems.entity';
import { GemsModule } from '../../src/gems/gems.module';
import { Repository } from 'typeorm';
import { APP_URL, PRIVATE_KEYS } from '../utils/constants';
import request from 'supertest';
import { PlatformConfigService } from '../../src/config/platformconfig/platformconfig.service';
import { INestApplication } from '@nestjs/common';
import { GemsReqDTO } from '../../src/gems/dto/GemsReqDTO';
import { User } from '../../src/users/entities/user.entity';
import { ethers } from 'ethers';

describe('GemsController (e2e)', () => {
  let token: string;
  let userId: number;
  let app: INestApplication;
  let platformConfigService: PlatformConfigService;
  let gemsRepository: Repository<Gems>;
  let userRepository: Repository<User>;
  let maxAmount: number;
  let minAmount: number;
  let status: number;
  let maxWin: number;

  const winningArrays = {
    7: ['a', 'a', 'a', 'a', 'a'],
    6: ['a', 'a', 'a', 'a', 'b'],
    5: ['a', 'a', 'a', 'b', 'b'],
    4: ['a', 'a', 'a', 'b', 'c'],
    3: ['a', 'a', 'b', 'b', 'c'],
    2: ['a', 'a', 'b', 'c', 'd'],
    1: ['a', 'b', 'c', 'd', 'e'],
  };

  const multipliers = {
    EASY: {
      7: 4,
      6: 2,
      5: 1.6,
      4: 1.3,
      3: 1.2,
      2: 1,
      1: 0,
    },
    MEDIUM: {
      7: 50,
      6: 7,
      5: 4,
      4: 3,
      3: 2,
      2: 0,
      1: 0,
    },
    HARD: {
      7: 80,
      6: 10,
      5: 7,
      4: 5,
      3: 0,
      2: 0,
      1: 0,
    },
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule, GemsModule],
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

    token = loginResponse.body.data.token;
    userId = loginResponse.body.data.user.id;

    gemsRepository = module.get<Repository<Gems>>(getRepositoryToken(Gems));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    platformConfigService = module.get<PlatformConfigService>(
      PlatformConfigService,
    );

    maxAmount = Number(await platformConfigService.get('gems.MaxAmount'));
    minAmount = Number(await platformConfigService.get('gems.MinAmount'));
    maxWin = Number(await platformConfigService.get('gems.MaxWin'));
    status = Number(await platformConfigService.get('gems.Status'));
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
      expect(maxWin).toBe(1000);
      expect(maxAmount).toBe(100);
      expect(minAmount).toBe(1);
      expect(status).toBe(1);
    });
  });

  describe('Not Authorized', () => {
    it('should not be Authorized if token has expired', async () => {
      const payload: GemsReqDTO = {
        difficulty: 'HARD',
        amount: Number(maxAmount),
      };

      const expiredToken =
        '"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6eyJpZCI6MSwibmFtZSI6IkFkbWluIiwiX19lbnRpdHkiOiJSb2xlIn0sInNlc3Npb25JZCI6MjQsImlhdCI6MTY5ODA0MTc3NywiZXhwIjoxNjk4MDQyNjc3fQ.4ehT3E_lbseoy7FtM1xz2C0tIebLLH4IjDQeIcXBOA4';
      await request(APP_URL)
        .post('/api/mines/create')
        .set('Authorization', `Bearer ${expiredToken}`)
        .send(payload);
    });
    it('should not be Authorized if no token has provided', async () => {
      const payload: GemsReqDTO = {
        difficulty: 'HARD',
        amount: Number(maxAmount),
      };
      await request(APP_URL)
        .post('/api/mines/create')
        .send(payload)
        .expect(401);
    });
  });

  describe('DTO types ensured', () => {});

  describe('create gems game endpoint: POST /api/gems/create', () => {
    it('should create a game successfully with response 201', async () => {
      const payload: GemsReqDTO = {
        difficulty: 'HARD',
        amount: Number(maxAmount),
      };

      const userBeforeGameCreation: User | null = await userRepository.findOne({
        where: {
          id: userId,
        },
      });
      expect(userBeforeGameCreation).toBeDefined();

      const initialBalance = userBeforeGameCreation
        ? userBeforeGameCreation.balance
        : 0;

      const response = await request(APP_URL)
        .post('/api/gems/create')
        .set('Authorization', `Bearer ${token}`)
        .send(payload)
        .expect(201)
        .expect(({ body }) => {
          expect(body).toBeDefined();
        });

      expect(response.body.success).toBe(true);
      expect(response.body.betId).toBeDefined();
      expect(response.body.initialBet).toBeDefined();
      expect(response.body.indexBet).toBeDefined();
      expect(response.body.profit).toBeDefined();

      const userAfterGameCreation = await userRepository.findOne({
        where: {
          id: userId,
        },
        cache: false,
      });
      const finalBalance = userAfterGameCreation
        ? userAfterGameCreation.balance
        : 0;

      const latestGame: Gems | null = await gemsRepository.findOne({
        where: {
          user: { id: userId },
        },
        order: { createdAt: 'DESC' },
      });
      if (latestGame) {
        /**
         * Balance TEST
         * should subtract the correct balance when a new game is created
         * */
        expect(Number(finalBalance)).toEqual(
          Number(initialBalance - payload.amount),
        );

        //Response TEST

        // Check if the difficulty and amount are set correctly
        expect(latestGame.difficulty).toEqual(payload.difficulty);
        expect(Number(latestGame.betAmount)).toEqual(payload.amount);

        // Validate the generated gems based on their winning array
        const winningArray = winningArrays[latestGame.prize];
        expect(JSON.parse(latestGame.generatedGems).length).toEqual(
          winningArray.length,
        );
        expect(latestGame.generatedGems).toBeDefined();

        // Check the prize, multiplier, and state
        expect(latestGame.prize).toBeGreaterThanOrEqual(1);
        expect(latestGame.prize).toBeLessThanOrEqual(7);
        expect(Number(latestGame.multiplier)).toEqual(
          multipliers[payload.difficulty][latestGame.prize],
        );
        expect(['WIN', 'LOSE']).toContain(latestGame.state);

        // If the user won, the profit should match the prize logic
        if (latestGame.state === 'WIN') {
          expect(Number(latestGame.profit)).toEqual(
            payload.amount * latestGame.multiplier,
          );
        } else {
          expect(Number(latestGame.profit)).toEqual(0);
        }
      }
    });
    it.skip('should not create a game if the difficulty input is not EASY MEDIUM HARD', async () => {
      const payload = {
        difficulty: 'hard',
        amount: 10,
      };
      await request(APP_URL)
        .post('/api/gems/create')
        .set('Authorization', `Bearer ${token}`)
        .send(payload)
        .expect(422)
        .expect(({ body }) => {
          expect(body).toBeDefined();
          expect(body).toEqual({
            status: 422,
            errors: {
              difficulty:
                'Invalid difficulty level, please enter a valid one, ex: EASY MEDIUM HARD',
            },
          });
        });
    });
    it.skip('should not create a game if betAmount is not smaller then max betAmount and it should be a number', async () => {
      const payload = {
        difficulty: 'HARD',
        amount: 999,
      };
      await request(APP_URL)
        .post('/api/gems/create')
        .set('Authorization', `Bearer ${token}`)
        .send(payload)
        .expect(400)
        .expect(({ body }) => {
          expect(body).toBeDefined();
          expect(body.message).toEqual('Maximum bet exceeded');
        });
    });
    it.skip('should not create a game if betAmount is not greater then min betAmount and it should be a number', async () => {
      const payload = {
        difficulty: 'HARD',
        amount: 0.1,
      };
      await request(APP_URL)
        .post('/api/gems/create')
        .set('Authorization', `Bearer ${token}`)
        .send(payload)
        .expect(400)
        .expect(({ body }) => {
          expect(body).toBeDefined();
          expect(body.message).toEqual('Minimum bet not reached');
        });
    });
    it.skip('should not create a game if betAmount is negative', async () => {
      const payload = {
        difficulty: 'HARD',
        amount: -1,
      };
      await request(APP_URL)
        .post('/api/gems/create')
        .set('Authorization', `Bearer ${token}`)
        .send(payload)
        .expect(422)
        .expect(({ body }) => {
          expect(body).toBeDefined();
        });
    });
    it.skip('should not create a game if betAmount is string', async () => {
      const payload = {
        difficulty: 'HARD',
        amount: 'string',
      };
      await request(APP_URL)
        .post('/api/gems/create')
        .set('Authorization', `Bearer ${token}`)
        .send(payload)
        .expect(422)
        .expect(({ body }) => {
          expect(body).toBeDefined();
        });
    });
    it.skip('should not create a game if difficulty is non string', async () => {
      const payload = {
        difficulty: 20,
        amount: 30,
      };
      await request(APP_URL)
        .post('/api/gems/create')
        .set('Authorization', `Bearer ${token}`)
        .send(payload)
        .expect(422)
        .expect(({ body }) => {
          expect(body).toBeDefined();
        });
    });
    it.skip('should not create a game if difficulty has extra white spaces', async () => {
      const payload: GemsReqDTO = {
        difficulty: ' HARD ',
        amount: Number(maxAmount),
      };

      await request(APP_URL)
        .post('/api/gems/create')
        .set('Authorization', `Bearer ${token}`)
        .send(payload)
        .expect(422)
        .expect(({ body }) => {
          expect(body).toBeDefined();
          expect(body).toEqual({
            status: 422,
            errors: {
              difficulty:
                'Invalid difficulty level, please enter a valid one, ex: EASY MEDIUM HARD',
            },
          });
        });
    });
    it.skip('should not create a game if payload is missing', async () => {
      const payload = {};

      await request(APP_URL)
        .post('/api/gems/create')
        .set('Authorization', `Bearer ${token}`)
        .send(payload)
        .expect(422)
        .expect(({ body }) => {
          expect(body).toBeDefined();
        });
    });
    it.skip('should not be Authorized if token has expired', async () => {
      const payload: GemsReqDTO = {
        difficulty: 'HARD',
        amount: Number(maxAmount),
      };
      const expiredToken =
        '"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6eyJpZCI6MSwibmFtZSI6IkFkbWluIiwiX19lbnRpdHkiOiJSb2xlIn0sInNlc3Npb25JZCI6MjQsImlhdCI6MTY5ODA0MTc3NywiZXhwIjoxNjk4MDQyNjc3fQ.4ehT3E_lbseoy7FtM1xz2C0tIebLLH4IjDQeIcXBOA4';
      await request(APP_URL)
        .post('/api/gems/create')
        .set('Authorization', `Bearer ${expiredToken}`)
        .send(payload);
    });
    it.skip('should not be Authorized if no token has provided', async () => {
      const payload: GemsReqDTO = {
        difficulty: 'HARD',
        amount: Number(maxAmount),
      };
      await request(APP_URL).post('/api/gems/create').send(payload).expect(401);
    });
    it.skip('should not create a game if it is inactive', async () => {
      const payload: GemsReqDTO = {
        difficulty: 'HARD',
        amount: Number(maxAmount),
      };
      if (!status)
        await request(APP_URL)
          .post('/api/gems/create')
          .set('Authorization', `Bearer ${token}`)
          .send(payload)
          .expect(400)
          .expect(({ body }) => {
            expect(body).toBeDefined();
          });
    });
    it.skip('should not create a game if amount is missing', async () => {
      const payload = {
        difficulty: 'HARD',
      };

      await request(APP_URL)
        .post('/api/gems/create')
        .set('Authorization', `Bearer ${token}`)
        .send(payload)
        .expect(422)
        .expect(({ body }) => {
          expect(body).toBeDefined();
        });
    });
    it.skip('should not create a game if difficulty is missing', async () => {
      const payload = { amount: 50 };

      await request(APP_URL)
        .post('/api/gems/create')
        .set('Authorization', `Bearer ${token}`)
        .send(payload)
        .expect(422)
        .expect(({ body }) => {
          expect(body).toBeDefined();
        });
    });
    it.skip('should not create a game if amount is a convertible string', async () => {
      const payload = { difficulty: 'EASY', amount: '50' };
      await request(APP_URL)
        .post('/api/gems/create')
        .set('Authorization', `Bearer ${token}`)
        .send(payload)
        .expect(422)
        .expect(({ body }) => {
          expect(body).toBeDefined();
        });
    });
    it.skip('should not create a game if the request body contains additional properties', async () => {
      const payload = {
        difficulty: 'EASY',
        amount: 50,
        extraProp: 'should not be here',
      };
      await request(APP_URL)
        .post('/api/gems/create')
        .set('Authorization', `Bearer ${token}`)
        .send(payload)
        .expect(422)
        .expect(({ body }) => {
          expect(body).toBeDefined();
        });
    });
    it.skip('should not create a game if user balance is bellow betAmount', async () => {
      const payload: GemsReqDTO = {
        difficulty: 'HARD',
        amount: Number(maxAmount),
      };
      const response = await request(APP_URL)
        .post('/api/gems/create')
        .set('Authorization', `Bearer ${token}`)
        .send(payload);

      const latestGame: Gems | null = await gemsRepository.findOne({
        where: {
          user: { id: userId },
        },
        order: { createdAt: 'DESC' },
      });

      if (latestGame && latestGame?.user.balance < payload.amount) {
        expect(response.status).toBe(400);

        expect(response.body).toEqual({
          message: 'Insufficient balance',
          error: 'Bad Request',
          statusCode: 400,
        });
      } else expect(response.status).toBe(201);
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
});
