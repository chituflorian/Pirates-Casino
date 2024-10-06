import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mines } from '../../../../mines/entities/mines.entity';
import { MinesSeedService } from './mines-seed.service';
import { User } from '../../../../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Mines]),
    TypeOrmModule.forFeature([User]),
  ],
  providers: [MinesSeedService],
  exports: [MinesSeedService],
})
export class TestMinesSeedModule {}
