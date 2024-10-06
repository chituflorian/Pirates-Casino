import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CrashService } from './crash.service';
import { Logger, OnModuleInit, UseGuards } from '@nestjs/common';
import { PlatformConfigService } from '../config/platformconfig/platformconfig.service';
import { EventsService } from './events.service';
import { CrashBetDto } from './dto/crash-bet.dto';
import { WsGuard } from '../auth/ws.guard';

@WebSocketGateway({
  namespace: 'crash',

  cors: {
    origin: '*',
  },
})
export class CrashGateway
  implements OnModuleInit, OnGatewayConnection, OnGatewayDisconnect
{
  private isServerReady = false;
  private online = 0;

  @WebSocketServer() server: Server;

  private readonly logger = new Logger(CrashGateway.name);

  constructor(
    private readonly platformConfigService: PlatformConfigService,
    private readonly crashService: CrashService,
    private readonly eventsService: EventsService,
  ) {}

  onModuleInit() {
    this.server.on('connection', (socket) => {
      console.log(socket.id);
      console.log('Connected');
    });
  }

  // public async afterInit(server: Server) {
  //   console.log('WebSocket server initialized!');
  //   this.eventsService.server = server;

  //   this.isServerReady = true;
  //   await this.crashService.initGame();
  // }

  handleConnection(@ConnectedSocket() client: Socket) {
    console.log(`Client connected: ${client.id}`);
    client.emit('welcome', { message: 'Welcome to the Crash Game!' });
    this.increaseOnline();
  }

  public handleDisconnect(@ConnectedSocket() client: Socket) {
    if (client.handshake.auth && client.handshake.auth.id) {
      this.eventsService.unlinkSocket(client.handshake.auth.id);
      client.handshake.auth = {};
    }

    this.decreaseOnline();
  }

  @UseGuards(WsGuard)
  @SubscribeMessage('crash:load')
  async handleCrashLoad(@ConnectedSocket() client: Socket) {
    if (!this.isServerReady) {
      return;
    }
    const game = this.crashService.getCurrentGame();

    if (!game) {
      return;
    }

    const history = await this.crashService.getHistory();

    client.emit('crash:load', {
      state: this.crashService.getState(),
      value: this.crashService.getValue(),
      crypto: this.crashService.getCrypto(),
      bets: this.crashService.getBets(),
      history,
    });
  }

  @UseGuards(WsGuard)
  @SubscribeMessage('newMessage')
  onNewMessage(@MessageBody() body: any, @ConnectedSocket() client: Socket) {
    console.log(body);
    console.log(client.handshake.auth.id);
  }

  @UseGuards(WsGuard)
  @SubscribeMessage('crash:bet')
  async handleCrashBet(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: CrashBetDto,
  ) {
    if (!this.isServerReady) {
      return;
    }

    if (!payload.amount) {
      return;
    }

    if (payload.autoCashOut && isNaN(payload.autoCashOut)) {
      return;
    }

    const amount = Number(payload.amount);

    if (isNaN(amount)) {
      return;
    }
    const minBet = await Number(this.platformConfigService.get('crash.minBet'));
    if (amount < minBet) {
      return client.emit('noty', {
        type: 'error',
        text: `Minimal bet is ${minBet} SOL`,
      });
    }

    const maxBet = await Number(this.platformConfigService.get('crash.MaxBet'));
    if (amount > maxBet) {
      return client.emit('noty', {
        type: 'error',
        text: `Maximum bet is ${maxBet}`,
      });
    }

    if (payload.autoCashOut && payload.autoCashOut < 1.01) {
      return client.emit('noty', {
        type: 'error',
        text: `Minimum auto cashout factor is 1.01`,
      });
    }

    await this.crashService.makeBet(
      client,
      client.handshake.auth.id,
      amount,
      payload.autoCashOut ?? 0,
    );
  }

  @UseGuards(WsGuard)
  @SubscribeMessage('crash:cashout')
  // @UseGuards(AuthWsGuard)
  async handleCrashCashout(@ConnectedSocket() client: Socket) {
    if (!this.isServerReady) {
      return;
    }

    await this.crashService.cashout(client, client.handshake.auth.id);
  }

  private increaseOnline() {
    this.online += 1;
    this.server.emit('online', this.online);
  }
  private decreaseOnline() {
    this.online -= 1;
    this.server.emit('online', this.online);
  }
}
