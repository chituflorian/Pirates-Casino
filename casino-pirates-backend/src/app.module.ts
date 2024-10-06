import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { FilesModule } from './files/files.module';
import { AuthModule } from './auth/auth.module';
import databaseConfig from './config/database.config';
import authConfig from './config/auth.config';
import appConfig from './config/app.config';
import fileConfig from './config/file.config';
import path from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { I18nModule } from 'nestjs-i18n/dist/i18n.module';
import { HeaderResolver } from 'nestjs-i18n';
import { TypeOrmConfigService } from './database/typeorm-config.service';
import { HomeModule } from './home/home.module';
import { DataSource, DataSourceOptions } from 'typeorm';
import { AllConfigType } from './config/config.type';
import { SessionModule } from './session/session.module';
import { GamesHistoryModule } from './games-history/games-history.module';
import { MinesModule } from './mines/mines.module';
import { PlatformConfigModule } from './config/platformconfig/platformconfig.module';
import { TowerModule } from './tower/tower.module';
import { GemsModule } from './gems/gems.module';
import { CrashModule } from './crash/crash.module';
import { ChatModule } from './chat/chat.module';
import { UserSettingsModule } from './user-settings/user-settings.module';
import { ReferralModule } from './referral/referral.module';
import { BlockchainModule } from './blockchain/blockchain.module';
import { BullModule } from '@nestjs/bull';
import { SchedulerModule } from './scheduler/scheduler.module';
import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';
import { CurrencyModule } from './currency/currency.module';
import { DepositModule } from './deposit/deposit.module';
import { WithdrawalModule } from './withdrawal/withdrawal.module';

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST ?? 'localhost',
        port: Number(process.env.REDIS_PORT ?? 6379),
      },
    }),
    BullBoardModule.forRoot({
      route: '/api/queues',
      adapter: ExpressAdapter, // Or FastifyAdapter from `@bull-board/fastify`
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, authConfig, appConfig, fileConfig],
      envFilePath: ['.env'],
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
      dataSourceFactory: async (options: DataSourceOptions) => {
        return new DataSource(options).initialize();
      },
    }),
    I18nModule.forRootAsync({
      useFactory: (configService: ConfigService<AllConfigType>) => ({
        fallbackLanguage: configService.getOrThrow('app.fallbackLanguage', {
          infer: true,
        }),
        loaderOptions: { path: path.join(__dirname, '/i18n/'), watch: true },
      }),
      resolvers: [
        {
          use: HeaderResolver,
          useFactory: (configService: ConfigService<AllConfigType>) => {
            return [
              configService.get('app.headerLanguage', {
                infer: true,
              }),
            ];
          },
          inject: [ConfigService],
        },
      ],
      imports: [ConfigModule],
      inject: [ConfigService],
    }),
    DepositModule,
    UsersModule,
    FilesModule,
    AuthModule,
    SessionModule,
    HomeModule,
    GamesHistoryModule,
    MinesModule,
    PlatformConfigModule,
    TowerModule,
    GemsModule,
    CrashModule,
    ChatModule,
    UserSettingsModule,
    ReferralModule,
    BlockchainModule,
    SchedulerModule,
    CurrencyModule,
    DepositModule,
    WithdrawalModule,
  ],
})
export class AppModule {}
