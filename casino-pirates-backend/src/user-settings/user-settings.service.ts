import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserSettings } from './entities/user-settings.entity';

@Injectable()
export class UserSettingsService {
  constructor(
    @InjectRepository(UserSettings)
    private readonly userSettingsRepository: Repository<UserSettings>,
  ) {}

  async getUserSettings(userId: number): Promise<UserSettings> {
    const settings = await this.userSettingsRepository.findOneBy({ userId });

    if (!settings) {
      throw new InternalServerErrorException(
        `User settings not found for user with id ${userId}`,
      );
    }

    return settings;
  }

  async updateUserSettings(
    userId: number,
    data: Partial<UserSettings>,
  ): Promise<void> {
    try {
      await this.userSettingsRepository.update({ userId }, data);
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to update user settings for user with id ${userId}`,
      );
    }
  }

  async isHideStatsEnabled(userId: number): Promise<boolean> {
    const settings = await this.userSettingsRepository.findOne({
      where: { userId },
      select: ['hideStats'],
    });

    if (!settings) {
      throw new InternalServerErrorException(
        `User settings not found for user with id ${userId}`,
      );
    }

    return settings.hideStats;
  }

  async isAnonymousEnabled(userId: number): Promise<boolean> {
    const settings = await this.userSettingsRepository.findOne({
      where: { userId },
      select: ['isAnonymous'],
    });

    if (!settings) {
      throw new InternalServerErrorException(
        `User settings not found for user with id ${userId}`,
      );
    }

    return settings.isAnonymous;
  }
}
