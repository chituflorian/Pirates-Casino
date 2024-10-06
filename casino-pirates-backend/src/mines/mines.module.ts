import { Module } from '@nestjs/common';
import { MinesController } from './mines.controller';
import { MinesService } from './mines.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mines } from './entities/mines.entity';
import { MinesRepository } from './mines.repository';
import { User } from '../users/entities/user.entity';
import { GamesHistoryService } from '../games-history/games-history.service';
import { GamesHistoryModule } from '../games-history/games-history.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Mines]),
    TypeOrmModule.forFeature([User]),
    GamesHistoryModule,
  ],
  controllers: [MinesController],
  providers: [MinesService, MinesRepository, GamesHistoryService],
  exports: [MinesService],
})
export class MinesModule {}
