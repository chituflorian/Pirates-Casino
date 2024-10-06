import { Server, Socket } from 'socket.io';

export class EventsService {
  public server: Server;
  private static userMap: { [key: number]: Socket } | null;

  public static getMap(): { [key: number]: Socket } {
    if (!this.userMap) {
      this.userMap = {};
    }
    return this.userMap;
  }

  public static addToMap(id: number, socket: Socket): void {
    if (!this.userMap) {
      this.userMap = {};
    }
    const existingSocket = this.userMap[id];
    if (existingSocket) {
      existingSocket.emit('multiwindow');
    }

    this.userMap[id] = socket;
  }

  linkSocket(id: number, socket: Socket): void {
    EventsService.addToMap(id, socket);
  }

  public static removeMap(id: number): void {
    if (this.userMap && this.userMap.hasOwnProperty(id)) {
      delete this.userMap[id];
    } else {
      // Handle the case where userMap is null or wallet key doesn't exist
      console.warn(
        `Cannot remove user: '${id}', it does not exist in the userMap or userMap is null.`,
      );
    }
  }

  unlinkSocket(id: number): void {
    EventsService.removeMap(id);
  }

  public getSocket(id: number): Socket {
    return EventsService.getMap()[id];
  }
}
