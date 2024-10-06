import { Module } from '@nestjs/common';
import { GemsController } from './gems.controller';
import { GemsService } from './gems.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Gems } from './entities/gems.entity';
import { User } from '../users/entities/user.entity';
import { GamesHistoryModule } from '../games-history/games-history.module';
import { GamesHistoryService } from '../games-history/games-history.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Gems]),
    TypeOrmModule.forFeature([User]),
    GamesHistoryModule,
  ],
  controllers: [GemsController],
  providers: [GemsService, GamesHistoryService],
})
export class GemsModule {}
