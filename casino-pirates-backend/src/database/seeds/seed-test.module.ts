import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import appConfig from '../../config/app.config';
import databaseConfig from '../../config/database.config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { TypeOrmConfigService } from '../typeorm-config.service';
import { TestRoleSeedModule } from './tests/role/role-seed.module';
import { TestStatusSeedModule } from './tests/status/status-seed.module';
import { TestUserSeedModule } from './tests/user/user-seed.module';
import { TestGameHistorySeedModule } from './tests/game-history/gameHistory-seed.module';
import { TestMinesSeedModule } from './tests/mines/mines-seed.module';
import { TestChainTypeSeedModule } from './tests/chainType/chainType-seed.module';
import { TestWalletSeedModule } from './tests/wallet/wallet-seed.module';
import { TestChainCurrencySeedModule } from './tests/chain_currencies/chain_currencies.module';
import { TestChainSeedModule } from './tests/chains/chains.module';
import { TestCurrencySeedModule } from './tests/currency/currency-seed.module';

@Module({
  imports: [
    TestRoleSeedModule,
    TestStatusSeedModule,
    TestUserSeedModule,
    TestGameHistorySeedModule,
    TestMinesSeedModule,
    TestChainTypeSeedModule,
    TestWalletSeedModule,
    TestChainSeedModule,
    TestCurrencySeedModule,
    TestChainCurrencySeedModule,

    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, appConfig],
      envFilePath: ['.env'],
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
      dataSourceFactory: async (options: DataSourceOptions) => {
        return new DataSource(options).initialize();
      },
    }),
  ],
})
export class TestSeedModule {}
