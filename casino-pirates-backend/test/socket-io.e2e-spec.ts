import { createServer } from 'node:http';
import { type AddressInfo } from 'node:net';
import { io as ioc } from 'socket.io-client';
import { Server } from 'socket.io';

describe('ChatGateway multiple clients (e2e)', () => {
  let io, serverSocket, clientSocket;

  beforeAll((done) => {
    const httpServer = createServer();
    io = new Server(httpServer);
    httpServer.listen(() => {
      const port = (httpServer.address() as AddressInfo).port;
      clientSocket = ioc(`http://localhost:${port}`);
      io.on('connection', (socket) => {
        serverSocket = socket;
      });
      clientSocket.on('connect', done);
    });
  });
  afterAll(() => {
    io.close();
    clientSocket.disconnect();
  });
  afterEach(() => {
    jest.clearAllTimers();
  });
  test('should work', (done) => {
    clientSocket.on('hello', (arg) => {
      expect(arg).toBe('world');
      done();
    });
    serverSocket.emit('hello', 'world');
  });
});
