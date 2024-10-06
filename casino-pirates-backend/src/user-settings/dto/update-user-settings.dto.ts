import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateUserSettingsDto {
  @IsBoolean()
  @IsOptional()
  readonly hideStats: boolean;

  @IsBoolean()
  @IsOptional()
  readonly isAnonymous: boolean;

  @IsBoolean()
  @IsOptional()
  readonly soundEffects: boolean;

  @IsBoolean()
  @IsOptional()
  readonly notifications: boolean;
}
