import { IsNumber, IsOptional, Validate } from 'class-validator';
import { IsDifferent } from '../../utils/validators/custom-validation-decorators';

export class ReferralTrackDTO {
  @IsNumber()
  referrerId: number;

  @IsNumber()
  @Validate(IsDifferent, ['referrerId'], {
    message: 'Referrer and referred cannot be the same user',
  })
  referredId: number;

  @IsNumber()
  @IsOptional()
  initialDeposit?: number;
}
