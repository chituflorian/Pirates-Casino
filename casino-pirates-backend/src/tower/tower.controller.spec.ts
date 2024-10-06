import { Test, TestingModule } from '@nestjs/testing';
import { TowerController } from './tower.controller';
import { TowerService } from './tower.service';
import { CreateTowerRespDTO } from './dto/CreateTowerRespDTO';
import { CreateTowerReqDTO } from './dto/CreateTowerReqDTO';
import { OpenTileResDTO } from './dto/OpenTileResDTO';
import { OpenTileReqDTO } from './dto/OpenTileReqDTO';
import httpMocks from 'node-mocks-http';
import { UserEntity } from '../users/users.decorator';
import { ITower } from './interface/ITower.interface';

const mockUser = {
  id: 1,
};
const mockRequest = httpMocks.createRequest({
  method: 'POST',
  url: '/cashout',
  user: mockUser,
});
describe('TowerController', () => {
  let controller: TowerController;
  let towerService: TowerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TowerController],
      providers: [
        {
          provide: TowerService,
          useValue: {
            create: jest.fn((x) => x),
            cashout: jest.fn((x) => x),
            openTile: jest.fn((x) => x),
          },
        },
      ],
    }).compile();

    controller = module.get<TowerController>(TowerController);
    towerService = module.get<TowerService>(TowerService);
    jest.clearAllMocks();
  });

  it('tower controller should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('tower service should be defined', () => {
    expect(towerService).toBeDefined();
  });
  describe('create', () => {
    it('should have a create function', () => {
      expect(controller.create).toBeDefined();
    });

    describe('when create is called', () => {
      const payload: CreateTowerReqDTO = {
        betAmount: 10,
        difficulty: 'EASY',
      };

      let result: CreateTowerRespDTO;

      it('then should call the towerService with a user request entity and payload', async () => {
        result = await controller.create(
          mockRequest.user as UserEntity,
          payload,
        );
        expect(towerService.create).toBeCalledWith(
          mockUser.id,
          payload.betAmount,
          payload.difficulty,
        );
      });

      it('then should create a game with specified difficulty and bet amount', async () => {
        const createMock = jest.spyOn(towerService, 'create');

        createMock.mockImplementation((): Promise<CreateTowerRespDTO> => {
          return Promise.resolve({
            id: 1,
            gameId: 'mocked-game-id',
            userMap: [],
            profitSteps: [],
            difficulty: 'EASY',
            state: 'IN_PROGRESS',
          });
        });

        result = await controller.create(
          mockRequest.user as UserEntity,
          payload,
        );
        expect(result).toBeDefined();
        expect(result).toStrictEqual({
          success: true,
          id: 1,
          gameId: 'mocked-game-id',
          userMap: 'mocked-user-map',
          profitSteps: 'mocked-profit-steps',
          difficulty: 'EASY',
          state: 'IN_PROGRESS',
        });
      });
    });
  });

  describe('cashout', () => {
    describe('when cashout is called', () => {
      let result: ITower;

      it('then it should call towerService with userId', async () => {
        result = await controller.cashout(mockRequest.user as UserEntity);
        expect(towerService.cashout).toBeCalledWith(mockUser.id);
      });

      it('should cashout the requested user the profit', async () => {
        const cashoutMock = jest.spyOn(towerService, 'cashout');
        cashoutMock.mockImplementation((): Promise<ITower> => {
          return Promise.resolve({
            id: 1,
            gameId: 'mocked-game-id',
            generatedMap: [] as number[][],
            userMap: [] as number[][],
            profitSteps: [] as number[],
            opened: 'mocked-opened',
            initialBet: 10.0,
            betAmount: 20.0,
            profit: 5.0,
            multiplier: 2.0,
            difficulty: 'EASY',
            state: 'FINISHED',
            createdAt: new Date('2023-10-04T08:54:02.257Z'),
            updatedAt: new Date('2023-10-04T08:54:02.257Z'),
          });
        });
        result = await controller.cashout(mockRequest.user as UserEntity);

        expect(result).toBeDefined();
        expect(result).toStrictEqual({
          success: true,
          game: {
            id: 1,
            gameId: 'mocked-game-id',
            generatedMap: 'mocked-generated-map',
            userMap: 'mocked-user-map',
            profitSteps: 'mocked-profit-steps',
            opened: 'mocked-opened',
            initialBet: 10.0,
            betAmount: 20.0,
            profit: 5.0,
            multiplier: 2.0,
            difficulty: 'EASY',
            state: 'FINISHED',
            createdAt: new Date('2023-10-04T08:54:02.257Z'),
            updatedAt: new Date('2023-10-04T08:54:02.257Z'),
          },
        });
      });
    });
  });

  describe('openTiles', () => {
    it('shoud have a openTile function', () => {
      expect(controller.openTile).toBeDefined();
    });

    describe('when openTiles is called', () => {
      let result: OpenTileResDTO | undefined;
      const payload: OpenTileReqDTO = {
        gameId: '46133daa-fd68-4e8f-98c9-e8055b2ccb04',
        tilePosition: 3,
      };
      it('then it should call the towerService with gameId and selected block', async () => {
        result = await controller.openTile(mockUser, payload);

        expect(towerService.openTile).toBeCalledWith(
          mockUser.id,
          payload.gameId,
          payload.tilePosition,
        );
      });
      it('should open a tile with specified gameId and block', async () => {
        const mockOpenTile = jest.spyOn(towerService, 'openTile');
        mockOpenTile.mockImplementation((): Promise<any> => {
          return Promise.resolve({
            success: true,
            blockPosition: 2,
            isTower: false,
            userMap:
              '[[0,0,0,0],[0,0,0,0],[0,1,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]]',
            state: 'IN_PROGRESS',
            activeRow: 4,
            profit: 15.15,
            multiplier: 2.16,
          });
        });
        result = await controller.openTile(
          mockRequest.user as UserEntity,
          payload,
        );
        const expected: any = {
          success: true,
          blockPosition: 2,
          isTower: false,
          userMap:
            '[[0,0,0,0],[0,0,0,0],[0,1,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]]',
          state: 'IN_PROGRESS',
          activeRow: 4,
          profit: 15.15,
          multiplier: 2.16,
        };
        expect(result).toStrictEqual(expected);
      });
    });
  });
});
