// import { INestApplication } from '@nestjs/common';
// import { Test, TestingModule } from '@nestjs/testing';
// import { AppModule } from '../../src/app.module';
// import { io, Socket } from 'socket.io-client';
// import { ChatService } from '../../src/chat/chat.service';
// import { ProfileService } from '../../src/profile/profile.service';
// import {
//   ADMIN_EMAIL,
//   ADMIN_PASSWORD,
//   APP_URL,
//   TESTER_EMAIL,
//   TESTER_PASSWORD,
// } from '../utils/constants';
// import request from 'supertest';
// import { Repository } from 'typeorm';
// import { Message } from '../../src/chat/entities/message.entity';
// import { getRepositoryToken } from '@nestjs/typeorm';

// describe('ChatGateway multiple clients (e2e)', () => {
//   let app: INestApplication;
//   let chatService: ChatService;
//   let profileService: ProfileService;
//   let messages: Message[];
//   const socketClients: Socket[] = [];
//   const tokens: string[] = [];
//   const socketUrl = `http://localhost:${process.env.APP_PORT}`;
//   const numberOfClients = 3;

//   beforeAll(async () => {
//     const moduleFixture: TestingModule = await Test.createTestingModule({
//       imports: [AppModule],
//       providers: [
//         {
//           provide: getRepositoryToken(Message),
//           useClass: Repository,
//         },
//       ],
//     }).compile();
//     app = moduleFixture.createNestApplication();
//     await app.init();

//     chatService = moduleFixture.get<ChatService>(ChatService);
//     profileService = moduleFixture.get<ProfileService>(ProfileService);

//     const clientLoginResponse1 = await request(APP_URL)
//       .post('/api/v1/auth/email/login')
//       .send({
//         email: TESTER_EMAIL,
//         password: TESTER_PASSWORD,
//       });
//     const clientLoginResponse2 = await request(APP_URL)
//       .post('/api/v1/auth/admin/email/login')
//       .send({
//         email: ADMIN_EMAIL,
//         password: ADMIN_PASSWORD,
//       });
//     const clientLoginResponse3 = await request(APP_URL)
//       .post('/api/v1/auth/email/login')
//       .send({
//         email: 'florian.chitu@example.com',
//         password: 'secret',
//       });
//     tokens.push(clientLoginResponse1.body.token);
//     tokens.push(clientLoginResponse2.body.token);
//     tokens.push(clientLoginResponse3.body.token);

//     const client1 = io(socketUrl, {
//       transports: ['websocket'],
//       query: { token: clientLoginResponse1.body.token },
//     });
//     const client2 = io(socketUrl, {
//       transports: ['websocket'],
//       query: { token: clientLoginResponse2.body.token },
//     });
//     const client3 = io(socketUrl, {
//       transports: ['websocket'],
//       query: { token: clientLoginResponse3.body.token },
//     });

//     socketClients.push(client1);
//     socketClients.push(client2);
//     socketClients.push(client3);

//     messages = await chatService.getMessages();
//     jest.setTimeout(10000); // 10 seconds
//   });
//   afterAll(async () => {
//     await app.close();

//     socketClients.forEach((client) => {
//       client.close();
//     });
//   });

//   it('chat service should be defined', () => {
//     expect(chatService).toBeDefined();
//   });
//   it('profileService service should be defined', () => {
//     expect(profileService).toBeDefined();
//   });

//   it('should handle multiple connections with different tokens and emit user count', (done) => {
//     let connectedClientsCount = 0;
//     let userCountEventsReceived = 0;

//     socketClients.forEach((client, index) => {
//       client.on('connect', () => {
//         connectedClientsCount++;
//         if (connectedClientsCount === numberOfClients) {
//           console.log(`Client ${index + 1} connected`);
//           // All clients are connected, now wait for 'get-users-count' events
//         }
//       });

//       client.on('get-users-count', (data) => {
//         expect(data).toBeDefined();
//         expect(data.connectedUsersCount).toBeLessThanOrEqual(numberOfClients);
//         console.log(
//           `User count from client ${index + 1}:`,
//           data.connectedUsersCount,
//         );

//         userCountEventsReceived++;
//         if (userCountEventsReceived === numberOfClients) {
//           // All 'get-users-count' events are received
//           console.log('All user count events received');
//           done();
//         }
//       });
//     });
//   });

//   it('should handle connection and emit events', (done) => {
//     // Choosing one client to test the connection and emitted events
//     const client = socketClients[0];

//     // Listen for the 'connected' event from the server
//     client.on('connected', (data) => {
//       try {
//         console.log(data, '******************');
//         // Assertions to verify the data structure
//         expect(data).toBeDefined();
//         expect(data.messages).toHaveLength(messages.length);
//         data.messages.forEach((message) => {
//           expect(message).toHaveProperty('id');
//           expect(typeof message.id).toBe('string');
//           expect(message).toHaveProperty('message');
//           expect(typeof message.message).toBe('string');
//           expect(message).toHaveProperty('createdAt');
//           expect(message).toHaveProperty('updatedAt');
//           expect(message).toHaveProperty('userId');
//           expect(typeof message.userId).toBe('number');
//           expect(message).toHaveProperty('name');
//           expect(typeof message.name).toBe('string');
//           expect(message).toHaveProperty('level');
//           expect(typeof message.level).toBe('number');
//         });

//         // Call done() to indicate test completion
//         done();
//       } catch (error) {
//         // If there's an error with the assertions, fail the test with done(error)
//         done(error);
//       }
//     });
//   });
//   //   it('should handle message event', (done) => {
//   //     const testMessage: SendMessageDto = {
//   //       userId: 1,
//   //       message: 'Hello World',
//   //     };

//   //     const client = socketClients[0];
//   //     client.emit('message', testMessage);

//   //     try {
//   //       client.on('message', (data) => {
//   //         expect(data).toBeDefined();
//   //         console.log(data);
//   //         expect(data.newMessage).toEqual(testMessage);
//   //         // Additional assertions as needed
//   //       });
//   //       done();
//   //     } catch (error) {
//   //       done(error);
//   //     }
//   //   });
//   //   it('should handle message event', (done) => {
//   //     const testMessage = { userId: 1, message: 'Hello World' };

//   //     socketClient[0].emit('message', testMessage);

//   //     socketClient[0].on('message', (data) => {
//   //       console.log(data);
//   //       expect(data).toBeDefined();
//   //       expect(data.newMessage).toEqual(testMessage);
//   //       // Additional assertions as needed
//   //       done();
//   //     });
//   //   });

//   //sometimes has async problems
//   it('should handle disconnection and emit updated user count', (done) => {
//     const disconnectingClientIndex = 1; // Index of the client to be disconnected
//     let userCountEventsReceived = 0;

//     // Listen for 'get-users-count' on remaining clients
//     socketClients.forEach((client, index) => {
//       if (index !== disconnectingClientIndex) {
//         client.on('get-users-count', (data) => {
//           expect(data).toBeDefined();
//           expect(data.connectedUsersCount).toBeLessThanOrEqual(
//             numberOfClients - 1,
//           ); // Expect one less user
//           console.log(
//             `Updated user count from client ${index + 1}:`,
//             data.connectedUsersCount,
//           );

//           userCountEventsReceived++;
//           if (userCountEventsReceived === numberOfClients - 1) {
//             // All remaining clients have received the updated user count
//             done();
//           }
//         });
//       }
//     });

//     // Disconnect one client
//     socketClients[disconnectingClientIndex].disconnect();
//   });
// });
