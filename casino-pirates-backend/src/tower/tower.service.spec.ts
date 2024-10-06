import { Test, TestingModule } from '@nestjs/testing';
import { TowerService, checkBlockSafety } from './tower.service';
import { EntityManager, Repository } from 'typeorm';
import { Tower } from './entities/tower.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { PlatformConfigService } from '../config/platformconfig/platformconfig.service';
import { CreateTowerReqDTO } from './dto/CreateTowerReqDTO';
import { CreateTowerRespDTO } from './dto/CreateTowerRespDTO';
import { OpenTileReqDTO } from './dto/OpenTileReqDTO';
const userId: number = 1;
const difficultyToSafeBlocks: Record<
  string,
  { safeBlocks: number; towers: number }
> = {
  EASY: { safeBlocks: 3, towers: 1 },
  MEDIUM: { safeBlocks: 2, towers: 1 },
  HARD: { safeBlocks: 1, towers: 1 },
  EXTREME: { safeBlocks: 1, towers: 2 },
  NIGHTMARE: { safeBlocks: 1, towers: 3 },
};

const stepsDictEasy: number[] = [
  1.26, 1.68, 2.25, 3.01, 4.01, 5.33, 7.11, 9.48, 12.67,
];
const stepsDictMedium: number[] = [1.42, 2.14, 3.2, 4.81, 7.21, 10.8, 16.22];
const stepsDictHard: number[] = [
  1.9, 3.8, 7.59, 15.19, 30.26, 60.69, 121.91, 242.37, 484.44,
];
const stepsDictExtreme: number[] = [2.85, 8.55, 25.63, 77.01, 229.3, 684.34];
const stepsDictNightmare: number[] = [
  3.8, 15.15, 60.51, 242.01, 970.52, 3840.21,
];
const difficultyStepsMap: Record<string, number[]> = {
  EASY: stepsDictEasy,
  MEDIUM: stepsDictMedium,
  HARD: stepsDictHard,
  EXTREME: stepsDictExtreme,
  NIGHTMARE: stepsDictNightmare,
};
describe('TowerService', () => {
  let service: TowerService;
  let towerRepository: Repository<Tower>;
  let userRepository: Repository<User>;
  let entityManager: EntityManager;
  let platformConfigService: PlatformConfigService;

  const mockTransactionalEntityManager = {
    save: jest.fn(),
    findOneBy: jest.fn(),
    transaction: jest.fn(async (callback) => {
      const transactionalEntityManager = {
        save: jest.fn().mockResolvedValue({
          gameId: 'uuidv4',
          generatedMap: 'YOUR_MOCKED_GAME_MAP',
          userMap: 'YOUR_MOCKED_USER_MAP',
          profitSteps: 'YOUR_MOCKED_PROFIT_STEPS',
          user: {},
          state: 'IN_PROGRESS',
        }),

        findOneBy: jest.fn().mockResolvedValue({
          user: {},
        }),
        findOne: jest.fn().mockResolvedValue(null),
        decrement: jest.fn(),
        increment: jest.fn(),
      };

      return await callback(transactionalEntityManager);
    }),
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TowerService,
        {
          provide: getRepositoryToken(Tower),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: EntityManager,
          useValue: mockTransactionalEntityManager,
        },
        {
          provide: PlatformConfigService,
          useValue: {
            get: jest.fn((x) => x),
            getAll: jest.fn((x) => x),
            set: jest.fn((x) => x),
          },
        },
      ],
    }).compile();

    service = module.get<TowerService>(TowerService);
    towerRepository = module.get<Repository<Tower>>(getRepositoryToken(Tower));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    entityManager = module.get<EntityManager>(EntityManager);
    platformConfigService = module.get<PlatformConfigService>(
      PlatformConfigService,
    );
  });

  it('service should be defined', () => {
    expect(service).toBeDefined();
  });

  it('tower repository should be defined', () => {
    expect(towerRepository).toBeDefined();
  });

  it('user repository should be defined', () => {
    expect(userRepository).toBeDefined();
  });

  it('platformConfigService should be defined', () => {
    expect(platformConfigService).toBeDefined();
  });

  it('entityManager should be defined,', () => {
    expect(entityManager).toBeDefined();
  });

  describe('create', () => {
    it('should have a create function', () => {
      expect(service.create).toBeDefined();
    });

    describe('when create function is called', () => {
      const payload: CreateTowerReqDTO = {
        betAmount: 50,
        difficulty: 'EASY',
      };
      let result: CreateTowerRespDTO;
      it('then should call the create with a userId, betAmount and difficulty', async () => {
        const createSpy: jest.SpyInstance = jest.spyOn(service, 'create');
        createSpy.mockResolvedValue(() => ({
          success: true,
          id: 1,
          gameId: 'dummy-game-id',
          userMap:
            '[[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]]',
          profitSteps:
            '[1.26, 1.68, 2.25, 3.01, 4.01, 5.33, 7.11, 9.48, 12.67]',
          difficulty: 'EASY',
          state: 'IN_PROGRESS',
        }));

        result = await service.create(
          userId,
          payload.betAmount,
          payload.difficulty,
        );
        expect(service.create).toBeCalledWith(
          userId,
          payload.betAmount,
          payload.difficulty,
        );
      });
      it('should initialize a new game with the payload: userId, difficulty and bet amount', async () => {
        const createdTower: CreateTowerRespDTO = {
          id: 1,
          gameId: '7b96937a-b4ac-4c05-84b8-9dd900bf7f8a',
          userMap: [
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
          ],
          profitSteps: [1.26, 1.68, 2.25, 3.01, 4.01, 5.33, 7.11, 9.48, 12.67],
          difficulty: 'EASY',
          state: 'IN_PROGRESS',
        };

        towerRepository.save = jest.fn().mockResolvedValue(createdTower);
        result = await service.create(
          userId,
          payload.betAmount,
          payload.difficulty,
        );

        expect(result).toBeDefined();
        expect(mockTransactionalEntityManager.transaction).toBeCalled();
        expect;
      });
    });

    describe('map generation for specified difficulty', () => {
      describe('easy difficulty', () => {
        const payload: CreateTowerReqDTO = {
          betAmount: 50,
          difficulty: 'EASY',
        };
        it('should generate a map with 3 safe blocks for "easy" difficulty', () => {
          const generatedMap = generateUserMap(payload.difficulty);

          const count = countSafeBlocksInMap(generatedMap);
          expect(count).toEqual(3);
          expect(generatedMap[0].length - count).toEqual(1);
        });
      });
      describe('medium difficulty', () => {
        const payload: CreateTowerReqDTO = {
          betAmount: 50,
          difficulty: 'MEDIUM',
        };
        it('should generate a map with 2/3 safe blocks for "medium" difficulty', () => {
          const generatedMap = generateUserMap(payload.difficulty);

          const count = countSafeBlocksInMap(generatedMap);
          expect(count).toEqual(2);
          expect(generatedMap[0].length - count).toEqual(1);
        });
      });
      describe('hard difficulty', () => {
        const payload: CreateTowerReqDTO = {
          betAmount: 50,
          difficulty: 'HARD',
        };
        it('should generate a map with 1/2 safe blocks for "hard" difficulty', () => {
          const generatedMap = generateUserMap(payload.difficulty);

          const count = countSafeBlocksInMap(generatedMap);
          expect(count).toEqual(1);
          expect(generatedMap[0].length - count).toEqual(1);
        });
      });
      describe('extreme difficulty', () => {
        const payload: CreateTowerReqDTO = {
          betAmount: 50,
          difficulty: 'EXTREME',
        };
        it('should generate a map with 1/3 safe blocks for "extreme" difficulty', () => {
          const generatedMap = generateUserMap(payload.difficulty);
          const count = countSafeBlocksInMap(generatedMap);

          expect(count).toEqual(1);
          expect(generatedMap[0].length - count).toEqual(2);
        });
      });
      describe('nightmare difficulty', () => {
        const payload: CreateTowerReqDTO = {
          betAmount: 50,
          difficulty: 'NIGHTMARE',
        };
        it('should generate a map with 1/4 safe blocks for "nightmare" difficulty', () => {
          const generatedMap = generateUserMap(payload.difficulty);

          const count = countSafeBlocksInMap(generatedMap);

          expect(count).toEqual(1);
          expect(generatedMap[0].length - count).toEqual(3);
        });
      });
    });

    describe('generateUserMap', () => {
      it('should generate a userMap with no opened blocks for EASY difficulty', () => {
        const userMap = generateOpenedMap('EASY');

        const hasOpenedBlocks = userMap.some((row) =>
          row.some((block) => block === 1),
        );
        expect(hasOpenedBlocks).toBeFalsy();
      });

      it('should generate a userMap with no opened blocks for MEDIUM difficulty', () => {
        const userMap = generateOpenedMap('MEDIUM');

        const hasOpenedBlocks = userMap.some((row) =>
          row.some((block) => block === 1),
        );
        expect(hasOpenedBlocks).toBeFalsy();
      });

      it('should generate a userMap with no opened blocks for HARD difficulty', () => {
        const userMap = generateOpenedMap('HARD');
        const hasOpenedBlocks = userMap.some((row) =>
          row.some((block) => block === 1),
        );
        expect(hasOpenedBlocks).toBeFalsy();
      });

      it('should generate a userMap with no opened blocks for EXTREME difficulty', () => {
        const userMap = generateOpenedMap('EXTREME');
        const hasOpenedBlocks = userMap.some((row) =>
          row.some((block) => block === 1),
        );
        expect(hasOpenedBlocks).toBeFalsy();
      });

      it('should generate a userMap with no opened blocks for NIGHTMARE difficulty', () => {
        const userMap = generateOpenedMap('NIGHTMARE');

        const hasOpenedBlocks = userMap.some((row) =>
          row.some((block) => block === 1),
        );
        expect(hasOpenedBlocks).toBeFalsy();
      });
    });

    describe('save game', () => {
      let result: CreateTowerRespDTO;

      it('should return a game with the correct response for a easy difficulty', async () => {
        const payload: CreateTowerReqDTO = {
          betAmount: 50,
          difficulty: 'EASY',
        };
        const createdTower: CreateTowerRespDTO = {
          id: 1,
          gameId: '7b96937a-b4ac-4c05-84b8-9dd900bf7f8a',
          userMap: [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
          ],
          profitSteps: [1.26, 1.68, 2.25, 3.01, 4.01, 5.33, 7.11, 9.48, 12.67],
          difficulty: 'EASY',
          state: 'IN_PROGRESS',
        };

        result = await service.create(
          userId,
          payload.betAmount,
          payload.difficulty,
        );

        expect(result).toBeDefined();
        expect(isUuidv4(result.gameId)).toBe(true);
        expect(result.userMap).toStrictEqual(createdTower.userMap);
        expect(result.profitSteps).toStrictEqual(createdTower.profitSteps);
        expect(result.difficulty).toStrictEqual(createdTower.difficulty);
        expect(result.state).toStrictEqual(createdTower.state);
      });
      it('should return a game with the correct response for a medium difficulty', async () => {
        const payload: CreateTowerReqDTO = {
          betAmount: 50,
          difficulty: 'MEDIUM',
        };
        const createdTower: CreateTowerRespDTO = {
          id: 1,
          gameId: '7b96937a-b4ac-4c05-84b8-9dd900bf7f8a',
          userMap: [
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0],
          ],
          profitSteps: [1.42, 2.14, 3.2, 4.81, 7.21, 10.8, 16.22],
          difficulty: 'MEDIUM',
          state: 'IN_PROGRESS',
        };

        result = await service.create(
          userId,
          payload.betAmount,
          payload.difficulty,
        );

        expect(result).toBeDefined();
        expect(isUuidv4(result.gameId)).toBe(true);
        expect(result.userMap).toStrictEqual(createdTower.userMap);
        expect(result.profitSteps).toStrictEqual(createdTower.profitSteps);
        expect(result.difficulty).toStrictEqual(createdTower.difficulty);
        expect(result.state).toStrictEqual(createdTower.state);
      });
      it('should return a game with the correct response for a hard difficulty', async () => {
        const payload: CreateTowerReqDTO = {
          betAmount: 50,
          difficulty: 'HARD',
        };
        const createdTower: CreateTowerRespDTO = {
          id: 1,
          gameId: '7b96937a-b4ac-4c05-84b8-9dd900bf7f8a',
          userMap: [
            [0, 0],
            [0, 0],
            [0, 0],
            [0, 0],
            [0, 0],
            [0, 0],
            [0, 0],
            [0, 0],
            [0, 0],
          ],
          profitSteps: [
            1.9, 3.8, 7.59, 15.19, 30.26, 60.69, 121.91, 242.37, 484.44,
          ],
          difficulty: 'HARD',
          state: 'IN_PROGRESS',
        };

        result = await service.create(
          userId,
          payload.betAmount,
          payload.difficulty,
        );

        expect(result).toBeDefined();
        expect(isUuidv4(result.gameId)).toBe(true);
        expect(result.userMap).toStrictEqual(createdTower.userMap);
        expect(result.profitSteps).toStrictEqual(createdTower.profitSteps);
        expect(result.difficulty).toStrictEqual(createdTower.difficulty);
        expect(result.state).toStrictEqual(createdTower.state);
      });
      it('should return a game with the correct response for a extreme difficulty', async () => {
        const payload: CreateTowerReqDTO = {
          betAmount: 50,
          difficulty: 'EXTREME',
        };
        const createdTower: CreateTowerRespDTO = {
          id: 1,
          gameId: '7b96937a-b4ac-4c05-84b8-9dd900bf7f8a',
          userMap: [
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0],
          ],
          profitSteps: [2.85, 8.55, 25.63, 77.01, 229.3, 684.34],
          difficulty: 'EXTREME',
          state: 'IN_PROGRESS',
        };

        result = await service.create(
          userId,
          payload.betAmount,
          payload.difficulty,
        );

        expect(result).toBeDefined();
        expect(isUuidv4(result.gameId)).toBe(true);
        expect(result.userMap).toStrictEqual(createdTower.userMap);
        expect(result.profitSteps).toStrictEqual(createdTower.profitSteps);
        expect(result.difficulty).toStrictEqual(createdTower.difficulty);
        expect(result.state).toStrictEqual(createdTower.state);
      });
      it('should return a game with the correct response for a nightmare difficulty', async () => {
        const payload: CreateTowerReqDTO = {
          betAmount: 50,
          difficulty: 'NIGHTMARE',
        };
        const createdTower: CreateTowerRespDTO = {
          id: 1,
          gameId: '7b96937a-b4ac-4c05-84b8-9dd900bf7f8a',
          userMap: [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
          ],
          profitSteps: [3.8, 15.15, 60.51, 242.01, 970.52, 3840.21],
          difficulty: 'NIGHTMARE',
          state: 'IN_PROGRESS',
        };

        result = await service.create(
          userId,
          payload.betAmount,
          payload.difficulty,
        );

        expect(result).toBeDefined();
        expect(isUuidv4(result.gameId)).toBe(true);
        expect(result.userMap).toStrictEqual(createdTower.userMap);
        expect(result.profitSteps).toStrictEqual(createdTower.profitSteps);
        expect(result.difficulty).toStrictEqual(createdTower.difficulty);
        expect(result.state).toStrictEqual(createdTower.state);
      });
    });

    describe('when transaction function is called', () => {
      const payload: CreateTowerReqDTO = {
        betAmount: 50,
        difficulty: 'EASY',
      };

      it('should call transaction with an async callback', async () => {
        await service.create(userId, payload.betAmount, payload.difficulty);

        expect(mockTransactionalEntityManager.transaction).toBeDefined();
        expect(mockTransactionalEntityManager.transaction).toHaveBeenCalled();
        expect(
          typeof mockTransactionalEntityManager.transaction(async () => {})
            .then,
        ).toBe('function');
      });
    });
  });
  // describe('cashout', () => {
  //   it('should have a create function', () => {
  //     expect(service.cashout).toBeDefined();
  //   });
  // });

  describe('openTile', () => {
    it('should have a openTile function', () => {
      expect(service.openTile).toBeDefined();
    });
    describe('when openTile function is called', () => {
      const payload: OpenTileReqDTO = {
        gameId: '7b96937a-b4ac-4c05-84b8-9dd900bf7f8a',
        tilePosition: 0,
      };

      it('should call openTile with a userId, gameId and a tilePosition', async () => {
        const createSpy: jest.SpyInstance = jest.spyOn(service, 'openTile');
        createSpy.mockResolvedValue(() => ({
          gameOver: true,
          blockPosition: 0,
          isTower: true,
          userMap: [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [2, 0, 0, 0],
          ],
          generatedMap: [
            [1, 1, 1, 2],
            [1, 1, 1, 2],
            [1, 1, 2, 1],
            [1, 1, 2, 1],
            [2, 1, 1, 1],
            [1, 2, 1, 1],
            [2, 1, 1, 1],
            [1, 1, 2, 1],
            [2, 1, 1, 1],
          ],
          state: 'LOST',
          activeRow: null,
          profit: 0,
          multiplier: 0,
        }));
        await service.openTile(userId, payload.gameId, payload.tilePosition);
        expect(service.openTile).toBeCalledWith(
          userId,
          payload.gameId,
          payload.tilePosition,
        );
      });
    });
  });
});

describe('checkBlockSafety', () => {
  const testGeneratedMap = [
    [1, 2, 1, 1],
    [1, 1, 2, 1],
    [2, 1, 1, 1],
  ];
  const testUserMap = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ];

  it('should mark the block as tower when there is a tower', () => {
    const result = checkBlockSafety(0, testGeneratedMap, testUserMap, 1);
    expect(result[2][0]).toBe(2); // Starting from the bottom (last row) and first position
  });

  it('should mark the block as safe when there is no tower', () => {
    const result = checkBlockSafety(1, testGeneratedMap, testUserMap, 1);
    expect(result[2][1]).toBe(1); // Starting from the bottom (last row) and second position
  });

  it('should not modify other rows', () => {
    const result = checkBlockSafety(0, testGeneratedMap, testUserMap, 1);
    expect(result[0]).toEqual([0, 0, 0, 0]);
    expect(result[1]).toEqual([0, 0, 0, 0]);
  });

  it('should not modify other blocks in the same row', () => {
    const result = checkBlockSafety(0, testGeneratedMap, testUserMap, 1);
    expect(result[2][2]).toBe(0);
    expect(result[2][3]).toBe(0);
  });
});

const countSafeBlocksInMap = (map: number[][]) => {
  if (!Array.isArray(map)) {
    throw new Error('Invalid map format');
  }

  let count = 0;
  for (const row of map) {
    if (!Array.isArray(row)) {
      throw new Error('Invalid map format');
    }
    count = 0;
    for (const block of row) {
      if (block === 0) {
        count++;
      }
    }
  }
  return count;
};

function generateOpenedMap(difficulty: string): number[][] {
  const safeBlocks = difficultyToSafeBlocks[difficulty].safeBlocks;
  const towers = difficultyToSafeBlocks[difficulty].towers;
  const stepsDict = difficultyStepsMap[difficulty];

  if (safeBlocks < 1 && safeBlocks > 3) {
    throw new Error('Invalid difficulty level');
  }
  const rows = stepsDict.length;
  const columns = safeBlocks + towers;
  const map: number[][] = Array(rows)
    .fill([])
    .map(() => Array(columns).fill(0));

  return map;
}

function generateUserMap(difficulty: string): number[][] {
  const safeBlocks = difficultyToSafeBlocks[difficulty].safeBlocks;
  const towers = difficultyToSafeBlocks[difficulty].towers;
  const stepsDict = difficultyStepsMap[difficulty];

  if (safeBlocks < 1 && safeBlocks > 3) {
    throw new Error('Invalid difficulty level');
  }
  const rows = stepsDict.length;
  const columns = safeBlocks + towers;
  const map: number[][] = Array(rows)
    .fill([])
    .map(() => Array(columns).fill(0));

  for (let i = 0; i < rows; i++) {
    let remainingTowers = towers;
    while (remainingTowers > 0) {
      const towerPosition = Math.floor(Math.random() * columns);
      if (map[i][towerPosition] === 0) {
        map[i][towerPosition] = 1;
        remainingTowers--;
      }
    }
  }
  return map;
}

function isUuidv4(value: string): boolean {
  const uuidv4Regex =
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89aAbB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
  return uuidv4Regex.test(value);
}
