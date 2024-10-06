import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { UserSettingsService } from './user-settings.service';
import { UpdateUserSettingsDto } from './dto/update-user-settings.dto';
import { User, UserEntity } from '../users/users.decorator';

type UserSettings = {
  hideStats: boolean;
  isAnonymous: boolean;
  soundEffects: boolean;
  notifications: boolean;
};

@ApiBearerAuth()
@ApiTags('User settings')
@Roles(RoleEnum.user)
@UseGuards(AuthGuard('jwt'))
@Controller('user-settings')
export class UserSettingsController {
  constructor(private readonly userSettingsService: UserSettingsService) {}

  @Get(':userId')
  async getUserSettings(@User() user: UserEntity): Promise<UserSettings> {
    return await this.userSettingsService.getUserSettings(user.id);
  }

  @Post(':userId/update-settings')
  async updateUserSettings(
    @User() user: UserEntity,
    @Body() body: UpdateUserSettingsDto,
  ): Promise<void> {
    return await this.userSettingsService.updateUserSettings(user.id, body);
  }
}
