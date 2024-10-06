// import { EventsService } from './events.service';
// import { Socket } from 'socket.io';
// describe('EventsService', () => {
//   beforeEach(() => {
//     // Clear userMap before each test
//     (EventsService as any).userMap = null;
//     mockEmit.mockClear();
//   });

//   it('should add a socket to the map', () => {
//     const id = 1;
//     EventsService.addToMap(id, mockSocket as Socket);
//     expect(EventsService.getMap()[id]).toBe(mockSocket);
//   });

//   it('should emit "multiwindow" if an id already has a socket', () => {
//     const id = 1;
//     EventsService.addToMap(id, mockSocket as Socket);
//     EventsService.addToMap(id, mockSocket as Socket);
//     expect(mockEmit).toHaveBeenCalledWith('multiwindow');
//   });

//   it('should remove a socket from the map', () => {
//     const id = 1;
//     EventsService.addToMap(id, mockSocket as Socket);
//     EventsService.removeMap(id);
//     expect(EventsService.getMap()[id]).toBeUndefined();
//   });

//   it('should warn if trying to remove a socket that does not exist', () => {
//     console.warn = jest.fn();

//     const id = 1;
//     EventsService.removeMap(id);

//     expect(console.warn).toHaveBeenCalledWith(
//       `Cannot remove user: '${id}', it does not exist in the userMap or userMap is null.`,
//     );
//   });

//   it('should return the correct socket for a given id', () => {
//     const id = 1;
//     EventsService.addToMap(id, mockSocket as Socket);
//     const socket = EventsService.getSocket(id);
//     expect(socket).toBe(mockSocket);
//   });
// });

// // Mocks
// const mockEmit = jest.fn();
// const mockSocket: Partial<Socket> = {
//   emit: mockEmit,
// };

// jest.mock('socket.io', () => {
//   return {
//     Server: jest.fn().mockImplementation(() => {
//       return {};
//     }),
//     Socket: jest.fn().mockImplementation(() => {
//       return mockSocket;
//     }),
//   };
// });
