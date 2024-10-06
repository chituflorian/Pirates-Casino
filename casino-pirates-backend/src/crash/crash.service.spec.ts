import { Test, TestingModule } from '@nestjs/testing';
import { CrashService } from './crash.service';
import { PlatformConfigService } from '../config/platformconfig/platformconfig.service';
import { EntityManager, Repository } from 'typeorm';
import { GAME_STATE } from './enums/state';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Crash } from './entities/crash.entity';

describe('CrashService', () => {
  let service: CrashService;
  let entityManager: EntityManager;
  let platformConfigService: PlatformConfigService;
  let crashRepository: Repository<Crash>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CrashService,
        {
          provide: EntityManager,
          useValue: {},
        },
        {
          provide: getRepositoryToken(Crash),
          useClass: Repository,
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

    service = module.get<CrashService>(CrashService);

    crashRepository = module.get<Repository<Crash>>(getRepositoryToken(Crash));
    platformConfigService = module.get<PlatformConfigService>(
      PlatformConfigService,
    );
    entityManager = module.get<EntityManager>(EntityManager);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('platformConfigService should be defined', () => {
    expect(platformConfigService).toBeDefined();
  });

  it('crash repository should be defined', () => {
    expect(crashRepository).toBeDefined();
  });

  it('entityManager should be defined,', () => {
    expect(entityManager).toBeDefined();
  });

  describe('checkStackedCrashes method', () => {
    it('should update the state of stacked crashes', async () => {
      const mockCrashes = [
        { gameId: '1', state: GAME_STATE.PREPARE },
        { gameId: '2', state: GAME_STATE.ACTIVE },
      ];

      crashRepository.find = jest.fn().mockResolvedValue(mockCrashes);
      crashRepository.update = jest.fn();
      await service.checkStackedCrashes();

      expect(crashRepository.update).toHaveBeenCalledTimes(2);
      expect(crashRepository.update).toHaveBeenNthCalledWith(1, '1', {
        state: GAME_STATE.CRASHED,
      });
      expect(crashRepository.update).toHaveBeenNthCalledWith(2, '2', {
        state: GAME_STATE.CRASHED,
      });
    });

    it('should not update if there are no stacked crashes', async () => {
      crashRepository.find = jest.fn().mockResolvedValue([]);
      crashRepository.update = jest.fn();

      await service.checkStackedCrashes();

      expect(crashRepository.update).not.toHaveBeenCalled();
    });
  });
});
