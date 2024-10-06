// import { Test, TestingModule } from '@nestjs/testing';
// import { MinesController } from './mines.controller';
// import { MinesService } from './mines.service';
// import { MinesCreateDTO } from './dto/MinesDTO';
// import { CreateMinesRespDTO } from './dto/CreateMinesRespDTO';
// import { CashoutMinesRespDTO } from './dto/CashoutMinesDTO';
// import { UserEntity } from '../users/users.decorator';
// import httpMocks from 'node-mocks-http';
// import { OpenTileResDTO } from './dto/OpenTileResDTO';
// import { OpenTileDTO } from './dto/OpenTileDTO';

// const mockUser: UserEntity = {
//   id: 1,
// };
// const mockRequest = httpMocks.createRequest({
//   method: 'POST',
//   url: '/cashout',
//   user: mockUser,
// });

// describe('GamesController', () => {
//   let controller: MinesController;
//   let minesService: MinesService;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       controllers: [MinesController],
//       providers: [
//         {
//           provide: MinesService,
//           useValue: {
//             create: jest.fn((x) => x),
//             cashout: jest.fn((x) => x),
//             openTile: jest.fn((x) => x),
//           },
//         },
//       ],
//     }).compile();

//     controller = module.get<MinesController>(MinesController);
//     minesService = module.get<MinesService>(MinesService);
//     jest.clearAllMocks();
//   });

//   it('controller should be defined', () => {
//     expect(controller).toBeDefined();
//   });

//   it('minesService should be defined', () => {
//     expect(minesService).toBeDefined();
//   });

//   describe('create', () => {
//     it('should have a create function', () => {
//       expect(controller.create).toBeDefined();
//     });

//     describe('when create is called', () => {
//       const payload: MinesCreateDTO = {
//         mines: 24,
//         amount: 50,
//       };
//       let result: CreateMinesRespDTO;
//       it('then it should call the minesService.create with userId, number of mines and bet', async () => {
//         result = await controller.create(
//           mockRequest.user as UserEntity,
//           payload,
//         );

//         expect(minesService.create).toBeCalledWith(
//           mockUser.id,
//           payload.mines,
//           payload.amount,
//         );
//       });

//       it('then it should create a mine game with specified mines and bet amount', async () => {
//         const createMock = jest.spyOn(minesService, 'create');

//         const mockResponse: CreateMinesRespDTO = {
//           success: true,
//           id: 4,
//           gameId: '0af1098a-d823-4814-94e4-f83190a02b8c',
//           userMap:
//             '[[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]]',
//           profitSteps: '[23.75]',
//         };

//         createMock.mockReturnValue(Promise.resolve(mockResponse));

//         result = await controller.create(
//           mockRequest.user as UserEntity,
//           payload,
//         );

//         const expected: CreateMinesRespDTO = {
//           success: true,
//           id: 4,
//           gameId: '0af1098a-d823-4814-94e4-f83190a02b8c',
//           userMap:
//             '[[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]]',
//           profitSteps: '[23.75]',
//         };
//         expect(result).toBeDefined();
//         expect(result).toStrictEqual(expected);
//       });
//     });
//   });

//   describe('cashout', () => {
//     it('should have a cashout function', () => {
//       expect(controller.cashout).toBeDefined();
//     });

//     describe('when cashout function is called', () => {
//       let result: CashoutMinesRespDTO;

//       it('should call the minesService with a user id', async () => {
//         result = await controller.cashout(mockRequest.user as UserEntity);
//         expect(minesService.cashout).toBeCalledWith(mockUser.id);
//       });

//       it('should cashout the requested user game', async () => {
//         const cashoutMock = jest.spyOn(minesService, 'cashout');
//         cashoutMock.mockImplementation((): Promise<CashoutMinesRespDTO> => {
//           return Promise.resolve({
//             success: true,
//             game: {
//               id: 7,
//               gameId: '7b96937a-b4ac-4c05-84b8-9dd900bf7f8a',
//               generatedMap:
//                 '[[0,0,0,0,0],[1,0,0,0,0],[0,0,0,0,1],[1,0,0,0,0],[1,0,0,0,0]]',
//               userMap:
//                 '[[0,1,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]]',
//               profitSteps:
//                 '[1.13,1.18,1.25,1.31,1.39,1.48,1.58,1.69,1.82,1.97,2.15,2.37,2.64,2.97,3.39,3.96,4.75,5.93,7.91,11.875,23.75]',
//               mines: 4,
//               tilesOpened: 1,
//               initialBet: 10.0,
//               betAmount: 20.0,
//               profit: 5.0,
//               multiplier: 2.0,
//               state: 'IN_PROGRESS',
//               createdAt: new Date('2023-10-04T08:54:02.257Z'),
//               updatedAt: new Date('2023-10-04T08:54:02.257Z'),
//             },
//           });
//         });

//         result = await controller.cashout(mockRequest.user as UserEntity);

//         expect(result).toBeDefined();
//         expect(result).toStrictEqual({
//           success: true,
//           game: {
//             id: 7,
//             gameId: '7b96937a-b4ac-4c05-84b8-9dd900bf7f8a',
//             generatedMap:
//               '[[0,0,0,0,0],[1,0,0,0,0],[0,0,0,0,1],[1,0,0,0,0],[1,0,0,0,0]]',
//             userMap:
//               '[[0,1,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]]',
//             profitSteps:
//               '[1.13,1.18,1.25,1.31,1.39,1.48,1.58,1.69,1.82,1.97,2.15,2.37,2.64,2.97,3.39,3.96,4.75,5.93,7.91,11.875,23.75]',
//             mines: 4,
//             tilesOpened: 1,
//             initialBet: 10.0,
//             betAmount: 20.0,
//             profit: 5.0,
//             multiplier: 2.0,
//             state: 'IN_PROGRESS',
//             createdAt: new Date('2023-10-04T08:54:02.257Z'),
//             updatedAt: new Date('2023-10-04T08:54:02.257Z'),
//           },
//         });
//       });
//     });
//   });

//   describe('openTile', () => {
//     it('shoud have a openTile function', () => {
//       expect(controller.openTile).toBeDefined();
//     });
//     describe('when openTile function is called', () => {
//       let result: OpenTileResDTO;
//       const payload: OpenTileDTO = {
//         gameId: '7b96937a-b4ac-4c05-84b8-9dd900bf7f8a',
//         x: 0,
//         y: 1,
//       };
//       it('then it should call the minesService with gameId and x,y block position', async () => {
//         result = await controller.openTile(
//           mockRequest.user as UserEntity,
//           payload,
//         );

//         expect(minesService.openTile).toBeCalledWith(
//           mockUser.id,
//           payload.gameId,
//           payload.x,
//           payload.y,
//         );
//       });
//       it('then it should open a tile with specified gameId and block', async () => {
//         const mockOpenTile = jest.spyOn(minesService, 'openTile');
//         mockOpenTile.mockImplementation((): Promise<OpenTileResDTO> => {
//           return Promise.resolve({
//             success: true,
//             isMine: false,
//             userMap:
//               '[[0,1,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]]',
//             lastTile: false,
//             profit: 22.599999999999998,
//             multiplier: 1.13,
//           });
//         });
//         result = await controller.openTile(
//           mockRequest.user as UserEntity,
//           payload,
//         );
//         const expected = {
//           success: true,
//           isMine: false,
//           userMap:
//             '[[0,1,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]]',
//           lastTile: false,
//           profit: 22.599999999999998,
//           multiplier: 1.13,
//         };
//         expect(result).toStrictEqual(expected);
//       });
//     });
//   });
// });
