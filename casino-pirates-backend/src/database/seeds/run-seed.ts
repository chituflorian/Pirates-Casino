import { NestFactory } from '@nestjs/core';
import { RoleSeedService } from './app/role/role-seed.service';
import { SeedModule } from './seed.module';
import { StatusSeedService } from './app/status/status-seed.service';

const runSeed = async () => {
  const app = await NestFactory.create(SeedModule);

  // run
  await app.get(RoleSeedService).run();
  await app.get(StatusSeedService).run();

  //await app.get(GameHistorySeedService).run();

  await app.close();
};

void runSeed();
