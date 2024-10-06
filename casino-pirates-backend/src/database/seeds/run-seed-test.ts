import { NestFactory } from '@nestjs/core';
import { RoleSeedService } from './tests/role/role-seed.service';
import { TestSeedModule } from './seed-test.module';
import { StatusSeedService } from './tests/status/status-seed.service';
import { UserSeedService } from './tests/user/user-seed.service';
import { ChainTypeSeedService } from './tests/chainType/chainType-seed.service';
import { WalletSeedService } from './tests/wallet/wallet-seed.service';
import { ChainCurrencySeedService } from './tests/chain_currencies/chain_currencies.service';
import { ChainSeedService } from './tests/chains/chains.service';
import { CurrencySeedService } from './tests/currency/currency-seed.service';

const runSeed = async () => {
  const app = await NestFactory.create(TestSeedModule);

  // run
  await app.get(RoleSeedService).run();
  await app.get(StatusSeedService).run();
  await app.get(UserSeedService).run();
  await app.get(ChainTypeSeedService).run();
  await app.get(WalletSeedService).run();
  await app.get(ChainSeedService).run();
  await app.get(CurrencySeedService).run();
  await app.get(ChainCurrencySeedService).run();

  // await app.get(GameHistorySeedService).run();

  await app.close();
};

void runSeed();
