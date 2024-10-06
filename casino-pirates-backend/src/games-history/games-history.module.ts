import { Module } from '@nestjs/common';
import { GamesHistoryController } from './games-history.controller';
import { GamesHistoryService } from './games-history.service';
import { GamesHistory } from './entities/games-history.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([GamesHistory])],
  controllers: [GamesHistoryController],
  providers: [GamesHistoryService],
  exports: [GamesHistoryService, TypeOrmModule],
})
export class GamesHistoryModule {}
