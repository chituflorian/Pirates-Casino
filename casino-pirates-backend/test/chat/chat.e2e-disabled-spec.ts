// import { INestApplication } from '@nestjs/common';
// import { Test, TestingModule } from '@nestjs/testing';
// import { AppModule } from '../../src/app.module';
// import { io, Socket } from 'socket.io-client';
// import { ChatService } from '../../src/chat/chat.service';
// import { ProfileService } from '../../src/profile/profile.service';
// import { APP_URL, TESTER_EMAIL, TESTER_PASSWORD } from '../utils/constants';
// import request from 'supertest';
// import { Repository } from 'typeorm';
// import { Message } from '../../src/chat/entities/message.entity';
// import { getRepositoryToken } from '@nestjs/typeorm';

// // fail do async problems TODO
// describe('ChatGateway (e2e)', () => {
//   let app: INestApplication;
//   let chatService: ChatService;
//   let profileService: ProfileService;
//   let token: string;
//   const socketUrl = `http://localhost:${process.env.APP_PORT}`;
//   let socketClient: Socket;

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

//     const clientLoginResponse = await request(APP_URL)
//       .post('/api/v1/auth/email/login')
//       .send({
//         email: TESTER_EMAIL,
//         password: TESTER_PASSWORD,
//       });

//     token = clientLoginResponse.body.token;

//     console.log(token);
//     socketClient = io(socketUrl, {
//       transports: ['websocket'],
//       query: { token },
//     });
//   });
//   afterAll(async () => {
//     await app.close();
//     socketClient.disconnect();
//   });

//   it('chat service should be defined', () => {
//     expect(chatService).toBeDefined();
//   });
//   it('profileService service should be defined', () => {
//     expect(profileService).toBeDefined();
//   });

//   describe('User Connection', () => {
//     it('should connect a user to the chat and increment user count', (done) => {
//       socketClient.on('connect', () => {
//         expect(socketClient.connected).toBeTruthy();
//         done();
//       });
//     });

//     it('should receive initial messages on connection', (done) => {
//       socketClient.on('connected', (data) => {
//         expect(data.messages.name).toBeDefined();
//         done();
//       });
//     });

//     it('should receive updated user count on connection', (done) => {
//       socketClient.on('get-users-count', (data) => {
//         expect(data.connectedUsersCount).toBeGreaterThan(0);
//         done();
//       });
//     });
//   });

//   describe('Message Handling', () => {
//     it('should send and receive a message', (done) => {
//       const testMessage = { userId: 2, message: 'Hello World' };

//       socketClient.emit('message', testMessage);

//       socketClient.on('message', (data) => {
//         expect(data.newMessage.message).toEqual('Hello World');
//         done();
//       });
//     });
//   });

//   describe.skip('Like and Unlike Messages', () => {
//     it('should like a message', (done) => {
//       const likeData = { userId: 2, messageId: 'messageId1' };

//       socketClient.emit('like', likeData);

//       socketClient.on('like', (data) => {
//         expect(data.likedMessageId).toEqual('messageId1');
//         done();
//       });
//     });

//     it('should unlike a message', (done) => {
//       const unlikeData = { userId: 2, messageId: 'messageId1' };

//       socketClient.emit('unlike', unlikeData);

//       socketClient.on('unlike', (data) => {
//         expect(data.unlikedMessageId).toEqual('messageId1');
//         done();
//       });
//     });
//   });

//   describe.skip('Reply to Messages', () => {
//     it('should reply to a message', (done) => {
//       const replyData = {
//         userId: 'user1',
//         reply: 'Reply Message',
//         originalMessageId: 'messageId1',
//       };

//       socketClient.emit('reply', replyData);

//       socketClient.on('reply', (data) => {
//         expect(data.newMessage.message).toEqual('Reply Message');
//         done();
//       });
//     });
//   });
//   describe('User Disconnection', () => {
//     it('should disconnect a user and decrement user count', (done) => {
//       socketClient.disconnect();

//       socketClient.on('disconnect', () => {
//         expect(socketClient.connected).toBeFalsy();
//         done();
//       });
//     });
//   });
// });
