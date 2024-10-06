// import { CrashGateway } from './CrashGateway';
// import { Test, TestingModule } from '@nestjs/testing';
// import { CrashService } from './crash.service';
// import { EventsService } from './events.service';
// import { Server } from 'socket.io';
// import { PlatformConfigService } from '../config/platformconfig/platformconfig.service';

// // Mock services and their methods
// jest.mock('./platform-config.service');
// jest.mock('./crash.service');
// jest.mock('./events.service');
// jest.mock('socket.io', () => {
//   return {
//     Server: jest.fn(() => ({
//       on: jest.fn(),
//       emit: jest.fn(),
//     })),
//   };
// });

// describe('CrashGateway', () => {
//   let gateway: CrashGateway;
//   // eslint-disable-next-line @typescript-eslint/no-unused-vars
//   let mockPlatformConfigService: PlatformConfigService;
//   let mockCrashService: CrashService;
//   let mockEventsService: EventsService;
//   let mockServer: Server;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [
//         CrashGateway,
//         PlatformConfigService,
//         CrashService,
//         EventsService,
//       ],
//     }).compile();

//     gateway = module.get<CrashGateway>(CrashGateway);
//     mockPlatformConfigService = module.get<PlatformConfigService>(
//       PlatformConfigService,
//     );
//     mockCrashService = module.get<CrashService>(CrashService);
//     mockEventsService = module.get<EventsService>(EventsService);
//     mockServer = new Server();
//     gateway.server = mockServer;
//   });

//   it('should be defined', () => {
//     expect(gateway).toBeDefined();
//   });

//   it('should initialize WebSocket server', async () => {
//     const initSpy = jest.spyOn(mockCrashService, 'initGame');
//     await gateway.afterInit(mockServer);
//     expect((gateway as any).eventsService).toBe(mockServer);
//     expect(initSpy).toHaveBeenCalled();
//     expect(gateway['isServerReady']).toBeTruthy();
//   });

//   it('should handle new connection and emit welcome message', () => {
//     const mockClient: any = {
//       id: '1234',
//       emit: jest.fn(),
//       handshake: { auth: { id: 1 } },
//     };
//     gateway.handleConnection(mockClient);
//     expect(mockClient.emit).toHaveBeenCalledWith('welcome', {
//       message: 'Welcome to the Crash Game!',
//     });
//   });

//   it('should unlink socket and decrease online count on disconnect', () => {
//     const onlineCountBefore = gateway['online'];
//     const mockClient: any = {
//       id: '1234',
//       handshake: { auth: { id: 1 } },
//     };

//     // Mocking the unlinkSocket method to make sure it's being called
//     const unlinkSpy = jest
//       .spyOn(mockEventsService, 'unlinkSocket')
//       .mockImplementation(() => {});

//     gateway.handleDisconnect(mockClient);
//     expect(unlinkSpy).toHaveBeenCalledWith(1);
//     expect(gateway['online']).toBe(onlineCountBefore - 1);
//   });
// });
