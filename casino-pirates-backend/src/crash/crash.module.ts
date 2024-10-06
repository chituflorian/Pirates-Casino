import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Crash } from './entities/crash.entity';
import { CrashController } from './crash.controller';
import { CrashService } from './crash.service';
import { CrashBets } from './crash-bets.service';
import { CrashBet } from './entities/crash-bet.entity';
import { EventsService } from './events.service';
import { AuthModule } from '../auth/auth.module';
import { CrashGateway } from './crash.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([Crash]),
    TypeOrmModule.forFeature([CrashBet]),
    AuthModule,
  ],
  controllers: [CrashController],
  providers: [CrashService, CrashBets, CrashGateway, EventsService],
})
export class CrashModule {}
