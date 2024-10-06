import {
  Logger,
  OnModuleInit,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import type {
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { WsGuard } from '../auth/ws.guard';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { LikeMessageDto } from './dto/like-message.dto';
import { ReplyMessageDto } from './dto/reply-message.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { UnlikeMessageDto } from './dto/unlike-message.to';
import { UserSettingsService } from '../user-settings/user-settings.service';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';

@UsePipes(new ValidationPipe())
@UseGuards(WsGuard)
@WebSocketGateway({
  namespace: 'chat',

  cors: {
    origin: '*',
  },
})
export class ChatGateway
  implements OnModuleInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private connectedUsersCount = 0;
  constructor(
    private readonly chatService: ChatService,
    private readonly userSettingsService: UserSettingsService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  onModuleInit() {
    this.server.on('connection', (socket) => {
      console.log(socket.id);
      console.log('Connected to chat');
    });
  }

  /**
   * @see @@auth/guards/ws.guard
   * @see https://stackoverflow.com/questions/58670553/nestjs-gateway-websocket-how-to-send-jwt-access-token-through-socket-emit
   */
  async handleConnection(@ConnectedSocket() client: Socket) {
    this.logger.log(`User connected: ${client.id}`);
    const messages = await this.chatService.getMessages();

    const result = await Promise.all(
      messages.map(async (message): Promise<any> => {
        const { username, level } = await this.userRepository.findOneOrFail({
          where: { id: message.userId },
        });
        const isAnonymous = await this.userSettingsService.isAnonymousEnabled(
          message.userId,
        );
        const name = isAnonymous ? 'Anonymous' : username;
        return { ...message, name, level };
      }),
    );

    this.connectedUsersCount++;
    this.server.emit('connected', { messages: result });
    this.server.emit('get-users-count', {
      connectedUsersCount: this.connectedUsersCount,
    });
  }
  handleDisconnect(@ConnectedSocket() client: Socket) {
    this.logger.log(`User disconnected: ${client.id}`);
    this.connectedUsersCount--;
    this.server.emit('get-users-count', {
      connectedUsersCount: this.connectedUsersCount,
    });
  }
  @SubscribeMessage('message')
  async handleMessage(@MessageBody() data: SendMessageDto): Promise<void> {
    const { userId, message } = data;
    this.logger.log(`Received message from ${userId}: ${message}`);
    const newMessage = await this.chatService.saveMessage(userId, message);
    const { username, level } = await this.userRepository.findOneOrFail({
      where: { id: userId },
    });
    const isAnonymous =
      await this.userSettingsService.isAnonymousEnabled(userId);

    const name = isAnonymous ? 'Anonymous' : username;

    this.server.emit('message', { ...newMessage, name, level });
  }
  @SubscribeMessage('like')
  async handleLike(@MessageBody() data: LikeMessageDto): Promise<void> {
    const { userId, messageId } = data;
    this.logger.log(`User ${userId} liked ${messageId}`);
    await this.chatService.likeMessage(messageId, userId);
    this.server.emit('like', {
      likedMessageId: messageId,
      likedByUserId: userId,
    });
  }
  @SubscribeMessage('unlike')
  async handleRemoveLike(@MessageBody() data: UnlikeMessageDto): Promise<void> {
    const { userId, messageId } = data;
    this.logger.log(`User ${userId} unliked ${messageId}`);
    await this.chatService.removeLikeFromMessage(messageId, userId);
    this.server.emit('unlike', {
      unlikedMessageId: messageId,
      unlikedByUserId: userId,
    });
  }
  @SubscribeMessage('reply')
  async handleReply(@MessageBody() data: ReplyMessageDto): Promise<void> {
    const { userId, reply, originalMessageId } = data;
    const originalMessage =
      await this.chatService.getMessageById(originalMessageId);
    this.logger.log(
      `User ${userId} replied to ${originalMessageId} with ${reply}`,
    );
    const newMessage = await this.chatService.saveMessage(
      userId,
      reply,
      originalMessageId,
    );
    ////TODO fix this
    const { username, level } = await this.userRepository.findOneOrFail({
      where: { id: userId },
    });
    const isAnonymous =
      await this.userSettingsService.isAnonymousEnabled(userId);

    const name = isAnonymous ? 'Anonymous' : username;

    this.server.emit('reply', {
      newMessage,
      originalMessage,
      name,
      level,
    });
    this.logger.log(
      `Reply sent to ${originalMessageId} from ${userId} with ${newMessage.message}`,
    );
  }
}
