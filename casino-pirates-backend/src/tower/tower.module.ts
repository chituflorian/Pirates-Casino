import { Module } from '@nestjs/common';
import { TowerService } from './tower.service';
import { TowerController } from './tower.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tower } from './entities/tower.entity';
import { User } from '../users/entities/user.entity';
import { GamesHistoryService } from '../games-history/games-history.service';
import { GamesHistoryModule } from '../games-history/games-history.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tower]),
    TypeOrmModule.forFeature([User]),
    GamesHistoryModule,
  ],
  controllers: [TowerController],
  providers: [TowerService, GamesHistoryService],
})
export class TowerModule {}
