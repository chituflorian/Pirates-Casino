// import { Test, TestingModule } from '@nestjs/testing';
// import { GemsController } from './gems.controller';
// import { GemsService } from './gems.service';
// import { GemsResDTO } from './dto/GemsResDTO';
// import { GemsReqDTO } from './dto/GemsReqDTO';
// import { UserEntity } from '../users/users.decorator';
// import httpMocks from 'node-mocks-http';

// const mockUser = {
//   id: 1,
// };
// const mockRequest = httpMocks.createRequest({
//   method: 'POST',
//   url: '/cashout',
//   user: mockUser,
// });
// describe('GemsController', () => {
//   let controller: GemsController;
//   let gemsService: GemsService;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       controllers: [GemsController],
//       providers: [
//         {
//           provide: GemsService,
//           useValue: {
//             create: jest.fn((x) => x),
//           },
//         },
//       ],
//     }).compile();

//     controller = module.get<GemsController>(GemsController);
//     gemsService = module.get<GemsService>(GemsService);
//     jest.clearAllMocks();
//   });

//   it('gems controller should be defined', () => {
//     expect(controller).toBeDefined();
//   });
//   it('gems service should be defined', () => {
//     expect(gemsService).toBeDefined();
//   });

//   describe('create', () => {
//     it('should have a create function', () => {
//       expect(controller.create).toBeDefined();
//     });
//     describe('when create is called', () => {
//       const payload: GemsReqDTO = {
//         difficulty: 'EASY',
//         amount: 50,
//       };
//       let result: GemsResDTO;

//       it('then should call the gemsService with a user request entity and payload', async () => {
//         result = await controller.create(
//           mockRequest.user as UserEntity,
//           payload,
//         );
//         expect(gemsService.create).toBeCalledWith(
//           mockUser.id,
//           payload.difficulty,
//           payload.amount,
//         );
//       });
//       it('then should create a game with specified difficulty and bet amount', async () => {
//         const createMock = jest.spyOn(gemsService, 'create');

//         const mockGemsResDTO: GemsResDTO = {
//           initialBet: [
//             'diamond',
//             'ruby',
//             'sapphire',
//             'emerald',
//             'diamond',
//             'pearl',
//           ],
//           indexBet: [1, 0, 0, 0, 1, 0],
//           profit: [
//             ['diamond', 'diamond'],
//             ['sapphire', 'sapphire', 'sapphire'],
//           ],
//         };

//         createMock.mockImplementation((): Promise<GemsResDTO> => {
//           return Promise.resolve(mockGemsResDTO);
//         });

//         result = await controller.create(
//           mockRequest.user as UserEntity,
//           payload,
//         );
//         expect(result).toBeDefined();
//         expect(result).toStrictEqual({
//           initialBet: [
//             'diamond',
//             'ruby',
//             'sapphire',
//             'emerald',
//             'diamond',
//             'pearl',
//           ],
//           indexBet: [1, 0, 0, 0, 1, 0],
//           profit: [
//             ['diamond', 'diamond'],
//             ['sapphire', 'sapphire', 'sapphire'],
//           ],
//         });
//       });
//     });
//   });
// });
