import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { PlatformConfigService } from './platformconfig.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../roles/roles.decorator';
import { RoleEnum } from '../../roles/roles.enum';
import { RolesGuard } from '../../roles/roles.guard';
import { SetConfigValueDto } from './dto/set-config-value.dto';
@Controller('config')
@ApiTags('Platform Config')
export class PlatformConfigController {
  constructor(private configService: PlatformConfigService) {}

  @Get()
  getAppConfig() {
    return this.configService.getAll();
  }

  @Post()
  @ApiBearerAuth()
  @Roles(RoleEnum.admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  setConfigValue(@Body() payload: SetConfigValueDto) {
    return this.configService.set(payload.key, payload.value);
  }
}
