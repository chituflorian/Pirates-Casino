import { Global, Module } from '@nestjs/common';
import { PlatformConfigController } from './platformconfig.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Config } from './entities/platformconfig.entity';
import { PlatformConfigService } from './platformconfig.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Config])],
  controllers: [PlatformConfigController],
  providers: [PlatformConfigService],
  exports: [PlatformConfigService],
})
export class PlatformConfigModule {}
