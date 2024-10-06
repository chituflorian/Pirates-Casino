// import { Test, TestingModule } from '@nestjs/testing';
// import { PlatformConfigService } from '../config/platformconfig/platformconfig.service';
// import { getRepositoryToken } from '@nestjs/typeorm';
// import { CrashBets } from './crash-bets.service';
// import { CrashBet } from './entities/crash-bet.entity';
// import { Repository } from 'typeorm';
// import { BET_STATE } from './enums/state';

// describe('CrashBetsService', () => {
//   let service: CrashBets;
//   let crashBetRepository: Repository<CrashBet>;
//   let platformConfigService: PlatformConfigService;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [
//         CrashBets,
//         {
//           provide: PlatformConfigService,
//           useValue: {
//             get: jest.fn((x) => x),
//             getAll: jest.fn((x) => x),
//             set: jest.fn((x) => x),
//           },
//         },
//         {
//           provide: getRepositoryToken(CrashBet),
//           useClass: Repository,
//         },
//       ],
//     }).compile();

//     service = module.get<CrashBets>(CrashBets);
//     crashBetRepository = module.get<Repository<CrashBet>>(
//       getRepositoryToken(CrashBet),
//     );
//     platformConfigService = module.get<PlatformConfigService>(
//       PlatformConfigService,
//     );
//   });

//   afterEach(() => {
//     jest.clearAllMocks();
//   });

//   it('should be defined', () => {
//     expect(service).toBeDefined();
//   });

//   it('platformConfigService should be defined', () => {
//     expect(platformConfigService).toBeDefined();
//   });

//   it('crashBet repository should be defined', () => {
//     expect(crashBetRepository).toBeDefined();
//   });

//   describe('add', () => {
//     it('should add a new bet', () => {
//       service.setGameId('game-123', 1);
//       const userId = 1;
//       const name = 'Test Name';
//       //   const wallet = 'test-wallet';
//       const amount = 50;
//       const initialBet = 50;
//       const multiplier = null;
//       const autoCashOut = 2; // Greater than 1 for testing this condition
//       const currency = 1;
//       const profile = 'test-profile';

//       const result = service.add(
//         userId,
//         name,
//         // wallet,
//         amount,
//         initialBet,
//         multiplier,
//         autoCashOut,
//         currency,
//         profile,
//       );

//       if (result) {
//         console.log(result);
//         expect(result).toHaveProperty('betId');
//         expect(result.userId).toBe(userId);
//         expect(result.state).toBe(BET_STATE.ACTIVE);
//         expect(result.autoCashOut).toBe(autoCashOut);
//         expect(result.gameId).toBeDefined();

//         expect(service['autoCashOuts'][result.betId]).toBe(autoCashOut);
//       } else console.log('result undefined');
//     });
//   });
// });
