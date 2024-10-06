import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { Message } from './entities/message.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { UserSettingsModule } from '../user-settings/user-settings.module';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    AuthModule,
    UserSettingsModule,
    TypeOrmModule.forFeature([Message, User]),
  ],
  providers: [ChatGateway, ChatService],
  exports: [ChatService],
})
export class ChatModule {}
