// import { Test, TestingModule } from '@nestjs/testing';
// import { MinesService } from './mines.service';
// import { Repository } from 'typeorm';
// import { getRepositoryToken } from '@nestjs/typeorm';
// import { User } from '../users/entities/user.entity';
// import { MinesRepository } from './mines.repository';
// import { PlatformConfigService } from '../config/platformconfig/platformconfig.service';
// import { EntityManager } from 'typeorm';
// import { Config } from '../config/platformconfig/entities/platformconfig.entity';

// describe('MinesService', () => {
//   let service: MinesService;
//   let usersRepository: Repository<User>;
//   let platformConfigService: PlatformConfigService;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [
//         MinesService,
//         PlatformConfigService,
//         {
//           provide: getRepositoryToken(Config),
//           useClass: Repository,
//         },
//         {
//           provide: MinesRepository,
//           useClass: MinesRepository,
//         },
//         {
//           provide: getRepositoryToken(User),
//           useClass: Repository,
//         },
//         {
//           provide: EntityManager,
//           useClass: EntityManager,
//         },
//       ],
//     }).compile();

//     service = module.get<MinesService>(MinesService);
//     usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
//     platformConfigService = module.get<PlatformConfigService>(
//       PlatformConfigService,
//     );
//   });

//   it('should be defined', () => {
//     expect(service).toBeDefined();
//   });

//   describe('create', () => {
//     it('should create a game', async () => {
//       // Arrange
//       const userId = 1;
//       const mines = 5;
//       const amount = 100;
//       const user = { id: userId } as User;
//       jest.spyOn(usersRepository, 'findOneBy').mockResolvedValue(user);
//       jest.spyOn(platformConfigService, 'get').mockResolvedValue('active'); // Mock the platformConfigService

//       // Act
//       const result = await service.create(userId, mines, amount);

//       // Assert
//       expect(result.success).toBe(true);
//       expect(typeof result.id).toBe('number');
//       // Add more assertions as needed
//     });
//   });
//   //   describe('cashout', () => {
//   //     // Write test cases for the cashout method
//   //   });

//   // Add more describe blocks for other methods in MinesService
// });
// export { MinesService };
