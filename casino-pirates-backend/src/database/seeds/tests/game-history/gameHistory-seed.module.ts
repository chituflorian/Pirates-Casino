import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GamesHistory } from '../../../../games-history/entities/games-history.entity';
import { GameHistorySeedService } from './gameHistory-seed.service';
import { User } from '../../../../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([GamesHistory]),
    TypeOrmModule.forFeature([User]),
  ],
  providers: [GameHistorySeedService],
  exports: [GameHistorySeedService],
})
export class TestGameHistorySeedModule {}
